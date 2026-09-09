package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.model.Hotel;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.service.HotelService;
import com.ceylonstay.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hotels")
@RequiredArgsConstructor
public class HotelController {

    private final HotelService hotelService;
    private final RoomService roomService;

    @GetMapping
    public List<Hotel> search(
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minStars,
            @RequestParam(required = false) String sortBy
    ) {
        return hotelService.searchHotels(district, query, minPrice, maxPrice, minStars, sortBy);
    }

    @GetMapping("/{id}")
    public Hotel getOne(@PathVariable String id) {
        return hotelService.getHotel(id);
    }

    @GetMapping("/{id}/rooms")
    public List<Room> getRooms(@PathVariable String id) {
        return roomService.getRoomsByHotel(id);
    }
}
