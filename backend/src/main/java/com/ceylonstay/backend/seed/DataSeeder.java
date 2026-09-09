package com.ceylonstay.backend.seed;

import com.ceylonstay.backend.model.*;
import com.ceylonstay.backend.repository.HotelRepository;
import com.ceylonstay.backend.repository.RoomRepository;
import com.ceylonstay.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Real, freely-licensed stock photos (Pexels License - free for
     * commercial use, no attribution required) used as placeholder imagery
     * until each hotel owner uploads their own real property photos via the
     * dashboard. These are generic/appropriately-themed photos, NOT actual
     * photography of the specific named properties below (which are real
     * hotels and whose real marketing photos are copyrighted and cannot be
     * embedded here).
     */
    private static String pexels(String id) {
        return "https://images.pexels.com/photos/" + id + "/pexels-photo-" + id + ".jpeg?auto=compress&cs=tinysrgb&w=1200";
    }

    // Themed photo pools
    private static final String COLONIAL_1 = pexels("33224238"); // historic colonial building, palm trees
    private static final String COLONIAL_2 = pexels("1838640");  // white colonial-style building
    private static final String LOBBY = pexels("31080809");      // luxury hotel lobby
    private static final String CITY_1 = pexels("6016976");      // modern hotel facade
    private static final String CITY_2 = pexels("8910835");      // modern architectural building
    private static final String TEA_HILLS = pexels("33437258");  // lush green tea plantation, misty hills

    private static final String POOL_SUNSET = pexels("6437583");     // infinity pool sunset
    private static final String BEACH_HUT = pexels("5893226");       // hut on resort beach at dusk
    private static final String BEACH_POOL = pexels("5914577");      // pool near the beach
    private static final String POOL_SWIM = pexels("2417862");       // person swimming in pool
    private static final String OVERWATER_VILLAS = pexels("11266129"); // villas over water
    private static final String INFINITY_POOL_2 = pexels("12913419");  // infinity pool, resort
    private static final String PALMS_SUNSET = pexels("11434425");     // palm trees near water, sunset
    private static final String POOL_TRANQUIL = pexels("28408327");    // tranquil infinity pool
    private static final String OCEAN_HORIZON = pexels("28408337");    // tropical sunset ocean horizon
    private static final String BEACH_PIER = pexels("15883403");      // tropical beach and pier at sunset
    private static final String POOL_SEA = pexels("11118953");        // pool by the sea
    private static final String NIPA_HUT = pexels("1724429");         // nipa hut over water
    private static final String OVERWATER_BUNGALOW = pexels("32267913"); // overwater bungalow sunset

    private static final String ROOM_MODERN = pexels("34672504");     // modern luxury hotel room
    private static final String ROOM_COZY = pexels("5883728");        // hotel room interior

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("CeylonStay: data already seeded, skipping.");
            return;
        }

        System.out.println("CeylonStay: seeding demo data...");

        User admin = userRepository.save(User.builder()
                .fullName("CeylonStay Admin")
                .email("admin@ceylonstay.lk")
                .password(passwordEncoder.encode("admin123"))
                .phone("+94 11 234 5678")
                .role(Role.ADMIN)
                .active(true)
                .build());

        User owner1 = userRepository.save(User.builder()
                .fullName("Nimal Perera")
                .email("owner1@ceylonstay.lk")
                .password(passwordEncoder.encode("owner123"))
                .phone("+94 77 111 2222")
                .role(Role.HOTEL_OWNER)
                .active(true)
                .build());

        User owner2 = userRepository.save(User.builder()
                .fullName("Kumari Silva")
                .email("owner2@ceylonstay.lk")
                .password(passwordEncoder.encode("owner123"))
                .phone("+94 77 333 4444")
                .role(Role.HOTEL_OWNER)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .fullName("Amaya Fernando")
                .email("guest@ceylonstay.lk")
                .password(passwordEncoder.encode("guest123"))
                .phone("+94 71 555 6666")
                .role(Role.GUEST)
                .active(true)
                .build());

        seedHotel(owner1.getId(), "Galle Face Hotel", "Colombo", "Colombo 3", "2 Galle Rd, Colombo 00300",
                6.9228, 79.8446, "Hotel", 5,
                "A landmark seafront hotel on Galle Face Green in the heart of Colombo, blending colonial-era architecture with sweeping views of the Indian Ocean.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Fitness Centre", "Room Service", "Air Conditioning", "24-Hour Front Desk", "Beachfront", "Garden"),
                List.of(COLONIAL_1, COLONIAL_2, LOBBY),
                new Object[][]{
                        {"Ocean Suite", "Spacious suite with a private balcony overlooking the Indian Ocean.", 58000.0, 2, 6, ROOM_MODERN},
                        {"Deluxe Room", "Elegant room with colonial furnishings and city or partial sea views.", 32000.0, 2, 12, ROOM_COZY},
                        {"Classic Room", "Comfortable room with garden views, ideal for business or leisure stays.", 21000.0, 2, 15, ROOM_MODERN}
                });

        seedHotel(owner1.getId(), "Cinnamon Grand Colombo", "Colombo", "Colombo 3", "77 Galle Rd, Colombo 00300",
                6.9186, 79.8478, "Hotel", 5,
                "A contemporary five-star city hotel in central Colombo with a wide choice of restaurants and easy access to shopping and business districts.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Fitness Centre", "Room Service", "Air Conditioning", "24-Hour Front Desk", "Conference Room", "Non-Smoking Rooms"),
                List.of(CITY_1, CITY_2, LOBBY),
                new Object[][]{
                        {"Club Room", "Upgraded room with access to the Club Lounge and complimentary breakfast.", 45000.0, 2, 8, ROOM_COZY},
                        {"Deluxe Room", "Modern room with city views and a work desk.", 27000.0, 2, 20, ROOM_MODERN},
                        {"Superior Room", "Well-appointed room ideal for short or extended city stays.", 19500.0, 2, 18, ROOM_COZY}
                });

        seedHotel(owner2.getId(), "Jetwing Lighthouse", "Galle", "Dadella", "Dadella, Galle 80000",
                6.0387, 80.2170, "Resort", 5,
                "A cliff-top resort designed by Geoffrey Bawa overlooking the ocean near the historic Galle Fort, with dramatic architecture and a private cove.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Beachfront", "Air Conditioning", "24-Hour Front Desk", "Garden", "Water Sports Facilities", "Diving"),
                List.of(POOL_SUNSET, PALMS_SUNSET, OVERWATER_BUNGALOW),
                new Object[][]{
                        {"Ocean View Room", "Room with floor-to-ceiling windows facing the Indian Ocean.", 42000.0, 2, 10, ROOM_MODERN},
                        {"Deluxe Room", "Bright room with a private balcony and modern decor.", 30000.0, 2, 14, ROOM_COZY},
                        {"Garden Room", "Peaceful room surrounded by tropical gardens.", 22000.0, 2, 12, ROOM_MODERN}
                });

        seedHotel(owner2.getId(), "Amangalla", "Galle", "Galle Fort", "10 Church St, Galle Fort 80000",
                6.0257, 80.2168, "Boutique Hotel", 5,
                "A meticulously restored 17th-century hotel within the walls of the UNESCO-listed Galle Fort, offering an intimate colonial-heritage stay.",
                List.of("Free WiFi", "Swimming Pool", "Restaurant", "Bar", "Spa & Wellness Centre", "Garden",
                        "Air Conditioning", "24-Hour Front Desk", "Non-Smoking Rooms", "Terrace"),
                List.of(COLONIAL_2, COLONIAL_1, LOBBY),
                new Object[][]{
                        {"Garden Suite", "Suite with antique furnishings opening onto a tropical garden.", 65000.0, 2, 5, ROOM_COZY},
                        {"Courtyard Room", "Room set around the hotel's historic central courtyard.", 48000.0, 2, 8, ROOM_MODERN}
                });

        seedHotel(owner1.getId(), "Cape Weligama", "Matara", "Weligama", "Weligama 81700",
                5.9587, 80.4293, "Resort", 5,
                "A clifftop luxury resort above Weligama Bay, popular with surfers and honeymooners, featuring an infinity pool suspended above the ocean.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Beachfront", "Fitness Centre", "Air Conditioning", "Water Sports Facilities", "Garden"),
                List.of(POOL_TRANQUIL, INFINITY_POOL_2, POOL_SUNSET),
                new Object[][]{
                        {"Ocean View Villa", "Private villa with plunge pool and uninterrupted ocean views.", 95000.0, 2, 6, ROOM_MODERN},
                        {"Deluxe Cabana", "Cabana-style room with direct garden and pool access.", 52000.0, 2, 10, ROOM_COZY}
                });

        seedHotel(owner2.getId(), "Heritance Kandalama", "Matale", "Dambulla", "Kandalama, Dambulla 21100",
                7.8567, 80.7180, "Resort", 5,
                "A Geoffrey Bawa-designed eco resort built into a rock face overlooking the Kandalama reservoir, near Sigiriya and Dambulla's cave temples.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Fitness Centre", "Air Conditioning", "24-Hour Front Desk", "Garden", "Bicycle Rental", "Tour Desk"),
                List.of(TEA_HILLS, OCEAN_HORIZON, LOBBY),
                new Object[][]{
                        {"Lake View Room", "Room facing the Kandalama reservoir and surrounding jungle.", 38000.0, 2, 15, ROOM_MODERN},
                        {"Forest View Room", "Room overlooking dense forest canopy, home to resident monkeys and birds.", 29000.0, 2, 18, ROOM_COZY}
                });

        seedHotel(owner1.getId(), "Earl's Regency Kandy", "Kandy", "Kandy", "Tennekumbura, Kandy 20000",
                7.2679, 80.6598, "Hotel", 5,
                "A hillside hotel on the banks of the Mahaweli River just outside Kandy city, with views towards the Hantana mountain range.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Fitness Centre", "Air Conditioning", "24-Hour Front Desk", "Conference Room", "Garden"),
                List.of(TEA_HILLS, CITY_2, LOBBY),
                new Object[][]{
                        {"River View Room", "Room with balcony overlooking the Mahaweli River.", 26000.0, 2, 14, ROOM_COZY},
                        {"Superior Room", "Comfortable hillside room close to the Temple of the Tooth.", 18500.0, 2, 20, ROOM_MODERN}
                });

        seedHotel(owner2.getId(), "Jetwing Vil Uyana", "Matale", "Sigiriya", "Sigiriya 21120",
                7.9683, 80.7500, "Resort", 5,
                "A sanctuary-style resort of villas set on stilts above wetlands, paddy fields and forest, close to the Sigiriya rock fortress.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Air Conditioning", "24-Hour Front Desk", "Garden", "Tour Desk", "Bicycle Rental"),
                List.of(OVERWATER_VILLAS, NIPA_HUT, OCEAN_HORIZON),
                new Object[][]{
                        {"Water Dwelling", "Villa with a private plunge pool overlooking a wetland lake.", 72000.0, 2, 8, ROOM_MODERN},
                        {"Forest Dwelling", "Villa surrounded by dense forest with views of Sigiriya rock.", 60000.0, 2, 10, ROOM_COZY}
                });

        seedHotel(owner1.getId(), "Anantara Peace Haven Tangalle", "Hambantota", "Tangalle", "Goyambokka, Tangalle 82200",
                6.0058, 80.7745, "Resort", 5,
                "A beachfront resort set among coconut groves on Sri Lanka's southern coast, with an emphasis on wellness and quiet, uncrowded beaches.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Beachfront", "Air Conditioning", "24-Hour Front Desk", "Garden", "Water Sports Facilities"),
                List.of(BEACH_HUT, BEACH_PIER, BEACH_POOL),
                new Object[][]{
                        {"Ocean View Suite", "Suite with a private terrace facing the Indian Ocean.", 68000.0, 2, 6, ROOM_MODERN},
                        {"Garden Room", "Room nestled among coconut palms a short walk from the beach.", 40000.0, 2, 12, ROOM_COZY}
                });

        seedHotel(owner2.getId(), "Heritance Tea Factory", "Nuwara Eliya", "Kandapola", "Kandapola, Nuwara Eliya 22200",
                6.9836, 80.7550, "Hotel", 4,
                "A converted 19th-century tea factory perched at 2,000m in the hill country, surrounded by working tea estates and cool mountain air.",
                List.of("Free WiFi", "Free Parking", "Restaurant", "Bar", "Spa & Wellness Centre",
                        "Air Conditioning", "24-Hour Front Desk", "Garden", "Tour Desk", "Fitness Centre"),
                List.of(TEA_HILLS, LOBBY, TEA_HILLS),
                new Object[][]{
                        {"Heritage Room", "Room built within the original factory structure with tea-estate views.", 33000.0, 2, 10, ROOM_COZY},
                        {"Superior Room", "Cosy mountain-view room, ideal for exploring nearby tea trails.", 24000.0, 2, 14, ROOM_MODERN}
                });

        seedHotel(owner1.getId(), "Jetwing Yala", "Hambantota", "Yala", "Palatupana, Yala 82600",
                6.3667, 81.4667, "Resort", 4,
                "A beachfront resort at the entrance to Yala National Park, popular as a base for leopard and elephant safaris.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Beachfront",
                        "Air Conditioning", "24-Hour Front Desk", "Garden", "Tour Desk"),
                List.of(POOL_SEA, BEACH_PIER, NIPA_HUT),
                new Object[][]{
                        {"Chalet Room", "Private chalet with garden views close to the beach.", 35000.0, 2, 12, ROOM_MODERN},
                        {"Standard Room", "Comfortable air-conditioned room, a short walk to the shore.", 24000.0, 2, 16, ROOM_COZY}
                });

        seedHotel(owner2.getId(), "Jetwing Jaffna", "Jaffna", "Jaffna", "Mahatma Gandhi Rd, Jaffna 40000",
                9.6650, 80.0089, "Hotel", 4,
                "A modern hotel in Jaffna town, a convenient base for exploring the Jaffna Fort, local markets and the northern peninsula's islands.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar",
                        "Air Conditioning", "24-Hour Front Desk", "Fitness Centre", "Conference Room"),
                List.of(CITY_2, CITY_1, LOBBY),
                new Object[][]{
                        {"Deluxe Room", "Spacious room with city views and modern amenities.", 20000.0, 2, 15, ROOM_MODERN},
                        {"Standard Room", "Compact, comfortable room for business or leisure travellers.", 14000.0, 2, 18, ROOM_COZY}
                });

        seedHotel(owner1.getId(), "Trinco Blu by Cinnamon", "Trincomalee", "Uppuveli", "Uppuveli Beach, Trincomalee 31000",
                8.6070, 81.2130, "Resort", 4,
                "A relaxed beach resort on Uppuveli beach on the east coast, known for calm waters, whale-watching trips and snorkelling.",
                List.of("Free WiFi", "Swimming Pool", "Free Parking", "Restaurant", "Bar", "Beachfront",
                        "Air Conditioning", "24-Hour Front Desk", "Water Sports Facilities", "Garden"),
                List.of(POOL_SWIM, PALMS_SUNSET, OVERWATER_BUNGALOW),
                new Object[][]{
                        {"Sea Facing Room", "Room with direct views over Uppuveli beach.", 27000.0, 2, 10, ROOM_MODERN},
                        {"Garden Room", "Ground-floor room opening onto tropical gardens.", 19000.0, 2, 14, ROOM_COZY}
                });

        System.out.println("CeylonStay: seeding complete - " + hotelRepository.count() + " hotels created.");
    }

    private void seedHotel(String ownerId, String name, String district, String city, String address,
                           double lat, double lng, String propertyType, int stars,
                           String description, List<String> facilities,
                           List<String> images, Object[][] roomsData) {

        Hotel hotel = Hotel.builder()
                .ownerId(ownerId)
                .name(name)
                .description(description)
                .propertyType(propertyType)
                .district(district)
                .city(city)
                .address(address)
                .location(new GeoPoint(lat, lng))
                .starRating(stars)
                .averageRating(0.0)
                .reviewCount(0)
                .facilities(facilities)
                .images(images)
                .checkInTime("14:00")
                .checkOutTime("11:00")
                .cancellationPolicy("Free cancellation up to 48 hours before check-in. Cancellations after that are subject to a one-night charge.")
                .status(HotelStatus.APPROVED)
                .build();

        Hotel saved = hotelRepository.save(hotel);

        double lowest = Double.MAX_VALUE;
        for (Object[] r : roomsData) {
            double price = (double) r[2];
            String roomImage = (String) r[5];
            Room room = Room.builder()
                    .hotelId(saved.getId())
                    .roomType((String) r[0])
                    .description((String) r[1])
                    .pricePerNight(price)
                    .maxOccupancy((int) r[3])
                    .totalUnits((int) r[4])
                    .facilities(List.of("Air Conditioning", "Free WiFi", "Flat-screen TV", "Private Bathroom", "Tea/Coffee Maker"))
                    .images(List.of(roomImage))
                    .breakfastIncluded(true)
                    .freeCancellation(true)
                    .active(true)
                    .build();
            roomRepository.save(room);
            if (price < lowest) lowest = price;
        }

        saved.setLowestPrice(lowest == Double.MAX_VALUE ? 0 : lowest);
        hotelRepository.save(saved);
    }
}