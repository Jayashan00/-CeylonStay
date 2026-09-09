# CeylonStay — Sri Lanka Hotel Booking Platform

A Booking.com-style hotel reservation platform built for Sri Lanka, with three
user roles (Guest, Hotel Owner, Admin), an interactive map of the island,
full CRUD for properties and rooms, and a real booking/modify/cancel flow.

**Stack:** React (Vite + Tailwind) · Spring Boot 3 · MongoDB · JWT auth · Leaflet maps

---

## 1. What's included

### Guest features
- Search & filter stays by district, price, star rating, keyword
- Interactive Sri Lanka map (Leaflet/OpenStreetMap) with price-pin markers
- Hotel detail pages: photo gallery, facilities, map, guest reviews
- Live booking widget with date range, guest counts, and price calculation
- Register/login, "My bookings" — **modify dates** or **cancel** a booking
- Booking confirmation page with reference number

### Hotel owner features
- Owner dashboard listing all their properties with status (pending/approved/rejected/suspended)
- Add/edit property: name, description, type, star rating, district/city/address
- **Click-to-pin location** on a live Sri Lanka map
- Facility checklist (tick from a master list of 30 property facilities, or type
  in your own custom ones — same pattern for room facilities)
- Room type management: add/edit/delete room types with price, occupancy,
  unit count, in-room facilities, images, breakfast/cancellation flags
- View & cancel bookings made on their properties

### Admin features
- Dashboard with platform stats (properties, users, bookings, revenue)
- Approve / reject / suspend / delete any property
- Manage users: activate/deactivate any guest or owner account
- View every booking on the platform

### Data
The backend seeds itself on first run with an admin account, two hotel-owner
accounts, a guest account, and **14 real Sri Lankan hotels** (Galle Face Hotel,
Cinnamon Grand Colombo, Jetwing Lighthouse, Amangalla, Cape Weligama,
Heritance Kandalama, Earl's Regency Kandy, Jetwing Vil Uyana, Anantara Peace
Haven Tangalle, Heritance Tea Factory, Jetwing Yala, Jetwing Jaffna, Trinco
Blu by Cinnamon) with their real districts and coordinates, each with 2–3
room types and realistic LKR pricing.

> **Note on images:** seed data uses placeholder photos (picsum.photos) since
> licensed photography for these properties can't be embedded here. Hotel
> owners can replace any image by pasting real photo URLs into the
> "Image URLs" field on the property/room forms — swap these for your own
> hosted photos before going live commercially.

---

## 2. Prerequisites

Install these first:

| Tool | Version | Check with |
|---|---|---|
| Java JDK | 17 or newer | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18 or newer | `node -v` |
| npm | 9+ | `npm -v` |
| MongoDB Community Server | 6.x or 7.x | — |
| MongoDB Compass (GUI, optional but recommended) | latest | — |

- Java: https://adoptium.net/
- Maven: https://maven.apache.org/download.cgi
- Node.js: https://nodejs.org/
- MongoDB Community Server: https://www.mongodb.com/try/download/community
- MongoDB Compass: https://www.mongodb.com/try/download/compass

---

## 3. Set up MongoDB

1. Install **MongoDB Community Server** and make sure the `mongod` service is
   running locally (on Windows/Mac the installer sets this up as a service
   automatically; on Linux run `sudo systemctl start mongod`).
2. It should be listening on the default port **27017**.
3. Open **MongoDB Compass** and connect to:
   ```
   mongodb://localhost:27017
   ```
4. You don't need to create the database or collections manually — the
   Spring Boot app will create the `ceylonstay` database and all collections
   automatically the first time it runs, and will seed demo data into it.
5. After you start the backend (next step), refresh Compass — you should see
   a `ceylonstay` database with `users`, `hotels`, `rooms`, `bookings`, and
   `reviews` collections.

If your MongoDB runs on a different host/port, or needs auth, update the URI in
`backend/src/main/resources/application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/ceylonstay
```

---

## 4. Run the backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

- On first startup, watch the console — you'll see:
  `CeylonStay: seeding demo data...` then `CeylonStay: seeding complete - 14 hotels created.`
- The API will be available at **http://localhost:8080**
- To rebuild a runnable jar instead: `mvn clean package` then
  `java -jar target/backend-1.0.0.jar`

### Demo accounts (created by the seeder)

| Role | Email | Password |
|---|---|---|
| Admin | admin@ceylonstay.lk | admin123 |
| Hotel Owner | owner1@ceylonstay.lk | owner123 |
| Hotel Owner | owner2@ceylonstay.lk | owner123 |
| Guest | guest@ceylonstay.lk | guest123 |

If you ever want to reset and reseed the data, drop the `ceylonstay` database
in Compass (right-click → Drop Database) and restart the backend.

---

## 5. Run the frontend (React)

Open a **second terminal** (keep the backend running):

```bash
cd frontend
npm install
npm run dev
```

- The app will open at **http://localhost:5173**
- It's already configured to call the backend at `http://localhost:8080/api`
  (see `frontend/src/api/client.js` if you need to change this, e.g. for
  deploying the backend elsewhere).

---

## 6. Trying it out

1. Go to http://localhost:5173 — browse hotels, use the map, search by district.
2. Sign in as **guest@ceylonstay.lk** and book a room on any hotel — check
   "My bookings" to modify dates or cancel.
3. Sign in as **owner1@ceylonstay.lk** — go to the owner dashboard, add a new
   property (pin it on the map, tick facilities), add room types, and note
   it starts in **Pending** status.
4. Sign in as **admin@ceylonstay.lk** — go to the admin dashboard, approve
   the pending property, and it will now appear in public search results.

---

## 7. Project structure

```
ceylonstay/
├── backend/                     Spring Boot API (Java 17, MongoDB)
│   ├── pom.xml
│   └── src/main/java/com/ceylonstay/backend/
│       ├── model/                Hotel, Room, Booking, User, Review, enums
│       ├── repository/           Spring Data MongoDB repositories
│       ├── dto/                  Request/response DTOs
│       ├── service/               Business logic
│       ├── controller/           REST endpoints (auth, hotels, rooms, bookings,
│       │                          reviews, meta, owner/*, admin/*)
│       ├── security/              JWT filter, UserDetails, JwtUtil
│       ├── config/                Spring Security config
│       ├── exception/             Global error handling
│       └── seed/DataSeeder.java   Seeds demo users + 14 real hotels
│
└── frontend/                    React 18 + Vite + Tailwind
    └── src/
        ├── api/client.js          Axios instance with JWT interceptor
        ├── context/AuthContext.jsx
        ├── components/            Navbar, Footer, HotelCard, SearchBar,
        │                          SriLankaMap, LocationPicker, FacilityChecklist,
        │                          DateRangeField, ConfirmDialog, etc.
        └── pages/
            ├── Home.jsx, HotelListing.jsx, HotelDetails.jsx
            ├── auth/               Login, Register
            ├── guest/              GuestBookings, BookingConfirmation
            ├── owner/               OwnerDashboard, OwnerHotelForm,
            │                        OwnerHotelRooms, OwnerBookings
            └── admin/               AdminDashboard, AdminHotels,
                                     AdminUsers, AdminBookings
```

---

## 8. API overview

All endpoints are under `http://localhost:8080/api`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Public search | `GET /hotels`, `GET /hotels/{id}`, `GET /hotels/{id}/rooms`, `GET /reviews/hotel/{id}` |
| Reference data | `GET /meta/districts`, `GET /meta/property-types`, `GET /meta/hotel-facilities`, `GET /meta/room-facilities` |
| Bookings (guest) | `POST /bookings`, `GET /bookings/my`, `PUT /bookings/{id}`, `PUT /bookings/{id}/cancel` |
| Reviews | `POST /reviews` |
| Owner | `GET/POST /owner/hotels`, `PUT/DELETE /owner/hotels/{id}`, `POST /owner/hotels/{id}/rooms`, `PUT/DELETE /owner/rooms/{id}`, `GET /owner/bookings`, `PUT /owner/bookings/{id}/cancel` |
| Admin | `GET /admin/hotels`, `GET /admin/hotels/pending`, `PUT /admin/hotels/{id}/status`, `DELETE /admin/hotels/{id}`, `GET /admin/users`, `PUT /admin/users/{id}/active`, `GET /admin/bookings`, `GET /admin/stats` |

Authenticated requests need `Authorization: Bearer <token>` (the token
returned by `/auth/login` or `/auth/register`).

---

## 9. Known limitations & good next steps

This is a fully working, functional platform, but before treating it as a
finished commercial product you'll likely want to add:

- **Real photos**: replace the placeholder seed images and give owners a
  proper file-upload flow (currently images are added by pasting URLs).
- **Payment integration** (Stripe/PayHere/local gateways) — bookings are
  currently confirmed without payment collection.
- **Double-booking / availability protection** — the current booking flow
  doesn't check room availability against overlapping dates; add an
  availability check in `BookingService.createBooking` before production use.
- **Email notifications** for booking confirmations, cancellations, and
  owner approval status changes.
- **Automated tests** — no unit/integration tests are included yet.
- **Currency/localization** — prices are hardcoded to LKR display formatting.
- **Review submission UI** — the review API exists (`POST /reviews`) but
  there's no guest-facing "leave a review" form wired up yet; only display
  of existing reviews is built.
- Production deployment: set a strong, secret `app.jwt.secret` (in
  `application.yml`) via environment variable, enable HTTPS, and restrict
  CORS `allowedOriginPatterns` to your real frontend domain instead of `*`.

---

Built as a full-stack scaffold — solid, working core across all three roles,
ready to extend into a full commercial product.
