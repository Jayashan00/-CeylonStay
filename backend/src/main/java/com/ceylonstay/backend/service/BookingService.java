package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.BookingRequest;
import com.ceylonstay.backend.dto.BookingUpdateRequest;
import com.ceylonstay.backend.exception.ApiException;
import com.ceylonstay.backend.model.*;
import com.ceylonstay.backend.repository.BookingRepository;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final AvailabilityService availabilityService;

    public Booking createBooking(String guestId, BookingRequest req) {
        Hotel hotel = hotelRepository.findById(req.getHotelId())
                .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
        Room room = roomRepository.findById(req.getRoomId())
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));

        if (!req.getCheckOut().isAfter(req.getCheckIn())) {
            throw new ApiException("Check-out date must be after check-in date", HttpStatus.BAD_REQUEST);
        }

        int rooms = req.getNumberOfRooms() == 0 ? 1 : req.getNumberOfRooms();

        // Real availability check: rejects the booking outright if the room
        // is already fully committed for any day in the requested range.
        availabilityService.assertAvailable(room.getId(), req.getCheckIn(), req.getCheckOut(), rooms, null);

        long nights = ChronoUnit.DAYS.between(req.getCheckIn(), req.getCheckOut());
        double total = room.getPricePerNight() * nights * rooms;

        Booking booking = Booking.builder()
                .bookingReference("CS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .guestId(guestId)
                .hotelId(hotel.getId())
                .roomId(room.getId())
                .hotelName(hotel.getName())
                .roomType(room.getRoomType())
                .checkIn(req.getCheckIn())
                .checkOut(req.getCheckOut())
                .adults(req.getAdults() == 0 ? 1 : req.getAdults())
                .children(req.getChildren())
                .numberOfRooms(rooms)
                .pricePerNight(room.getPricePerNight())
                .totalPrice(total)
                .guestFullName(req.getGuestFullName())
                .guestEmail(req.getGuestEmail())
                .guestPhone(req.getGuestPhone())
                .specialRequests(req.getSpecialRequests())
                .status(BookingStatus.CONFIRMED)
                .totalPaid(0.0)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        return bookingRepository.save(booking);
    }

    public List<Booking> getGuestBookings(String guestId) {
        return bookingRepository.findByGuestId(guestId);
    }

    public Booking getBooking(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ApiException("Booking not found", HttpStatus.NOT_FOUND));
    }

    public List<Booking> getHotelBookings(String hotelId) {
        return bookingRepository.findByHotelId(hotelId);
    }

    /** Active bookings for one specific room, ownership-checked — powers the owner's per-room calendar. */
    public List<Booking> getBookingsForRoomOwnerScoped(String roomId, String requesterId, boolean isAdmin) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ApiException("Room not found", HttpStatus.NOT_FOUND));
        if (!isAdmin) {
            Hotel hotel = hotelRepository.findById(room.getHotelId())
                    .orElseThrow(() -> new ApiException("Hotel not found", HttpStatus.NOT_FOUND));
            if (!hotel.getOwnerId().equals(requesterId)) {
                throw new ApiException("You do not own this room", HttpStatus.FORBIDDEN);
            }
        }
        return bookingRepository.findByRoomId(roomId).stream()
                .filter(b -> b.getStatus() != BookingStatus.CANCELLED)
                .collect(java.util.stream.Collectors.toList());
    }

    public List<Booking> getBookingsForOwnerHotels(List<String> hotelIds) {
        return bookingRepository.findByHotelIdIn(hotelIds);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking modifyBooking(String bookingId, String requesterId, BookingUpdateRequest req) {
        Booking booking = getBooking(bookingId);
        if (!booking.getGuestId().equals(requesterId)) {
            throw new ApiException("You can only modify your own bookings", HttpStatus.FORBIDDEN);
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ApiException("Cannot modify a cancelled booking", HttpStatus.BAD_REQUEST);
        }

        if (req.getCheckIn() != null) booking.setCheckIn(req.getCheckIn());
        if (req.getCheckOut() != null) booking.setCheckOut(req.getCheckOut());
        if (req.getAdults() > 0) booking.setAdults(req.getAdults());
        booking.setChildren(req.getChildren());
        if (req.getNumberOfRooms() > 0) booking.setNumberOfRooms(req.getNumberOfRooms());
        if (req.getSpecialRequests() != null) booking.setSpecialRequests(req.getSpecialRequests());

        if (!booking.getCheckOut().isAfter(booking.getCheckIn())) {
            throw new ApiException("Check-out date must be after check-in date", HttpStatus.BAD_REQUEST);
        }

        // Re-check availability for the new dates/room count, excluding this
        // booking's own current hold so it doesn't collide with itself.
        availabilityService.assertAvailable(booking.getRoomId(), booking.getCheckIn(), booking.getCheckOut(),
                booking.getNumberOfRooms(), booking.getId());

        long nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
        booking.setTotalPrice(booking.getPricePerNight() * nights * booking.getNumberOfRooms());
        booking.setStatus(BookingStatus.MODIFIED);
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    public Booking cancelBooking(String bookingId, String requesterId, boolean isPrivileged) {
        Booking booking = getBooking(bookingId);
        if (!isPrivileged && !booking.getGuestId().equals(requesterId)) {
            throw new ApiException("You can only cancel your own bookings", HttpStatus.FORBIDDEN);
        }
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(LocalDateTime.now());
        return bookingRepository.save(booking);
    }

    /**
     * Recomputes totalPaid and paymentStatus from the payment ledger.
     * Called by PaymentService whenever a payment is added, edited, or
     * deleted, so Booking always reflects the source-of-truth ledger total.
     */
    public void applyPaymentTotal(String bookingId, double totalPaid) {
        Booking booking = getBooking(bookingId);
        booking.setTotalPaid(totalPaid);

        if (totalPaid <= 0) {
            booking.setPaymentStatus(PaymentStatus.UNPAID);
        } else if (totalPaid >= booking.getTotalPrice()) {
            booking.setPaymentStatus(PaymentStatus.PAID);
        } else {
            booking.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
        }
        bookingRepository.save(booking);
    }
}
