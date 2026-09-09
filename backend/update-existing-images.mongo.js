// Run this in MongoDB Compass's "MONGOSH" tab (bottom of the window) while
// connected to your ceylonstay database, or via `mongosh ceylonstay` in a
// terminal. It updates the `images` field on your EXISTING hotel and room
// documents in place — it does not touch users, bookings, or anything else.
//
// Usage in Compass: open the database, click the ">_ MONGOSH" tab, paste
// this whole script, press Enter.

const hotelImages = {
  "Galle Face Hotel": [
    "https://images.pexels.com/photos/33224238/pexels-photo-33224238.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Cinnamon Grand Colombo": [
    "https://images.pexels.com/photos/6016976/pexels-photo-6016976.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/8910835/pexels-photo-8910835.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Jetwing Lighthouse": [
    "https://images.pexels.com/photos/6437583/pexels-photo-6437583.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/11434425/pexels-photo-11434425.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/32267913/pexels-photo-32267913.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Amangalla": [
    "https://images.pexels.com/photos/1838640/pexels-photo-1838640.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/33224238/pexels-photo-33224238.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Cape Weligama": [
    "https://images.pexels.com/photos/28408327/pexels-photo-28408327.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/12913419/pexels-photo-12913419.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/6437583/pexels-photo-6437583.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Heritance Kandalama": [
    "https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/28408337/pexels-photo-28408337.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Earl's Regency Kandy": [
    "https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/8910835/pexels-photo-8910835.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Jetwing Vil Uyana": [
    "https://images.pexels.com/photos/11266129/pexels-photo-11266129.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1724429/pexels-photo-1724429.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/28408337/pexels-photo-28408337.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Anantara Peace Haven Tangalle": [
    "https://images.pexels.com/photos/5893226/pexels-photo-5893226.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/15883403/pexels-photo-15883403.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/5914577/pexels-photo-5914577.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Heritance Tea Factory": [
    "https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/33437258/pexels-photo-33437258.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Jetwing Yala": [
    "https://images.pexels.com/photos/11118953/pexels-photo-11118953.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/15883403/pexels-photo-15883403.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/1724429/pexels-photo-1724429.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Jetwing Jaffna": [
    "https://images.pexels.com/photos/8910835/pexels-photo-8910835.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/6016976/pexels-photo-6016976.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/31080809/pexels-photo-31080809.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ],
  "Trinco Blu by Cinnamon": [
    "https://images.pexels.com/photos/2417862/pexels-photo-2417862.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/11434425/pexels-photo-11434425.jpeg?auto=compress&cs=tinysrgb&w=1200",
    "https://images.pexels.com/photos/32267913/pexels-photo-32267913.jpeg?auto=compress&cs=tinysrgb&w=1200"
  ]
};

const roomImageA = "https://images.pexels.com/photos/34672504/pexels-photo-34672504.jpeg?auto=compress&cs=tinysrgb&w=1000";
const roomImageB = "https://images.pexels.com/photos/5883728/pexels-photo-5883728.jpeg?auto=compress&cs=tinysrgb&w=1000";

let hotelsUpdated = 0;
let roomsUpdated = 0;

Object.keys(hotelImages).forEach((name) => {
  const hotel = db.hotels.findOne({ name: name });
  if (!hotel) {
    print("Skipped (not found): " + name);
    return;
  }

  db.hotels.updateOne({ _id: hotel._id }, { $set: { images: hotelImages[name] } });
  hotelsUpdated++;

  // Alternate room images so a hotel's room types don't all look identical.
  const rooms = db.rooms.find({ hotelId: hotel._id.toString() }).toArray();
  rooms.forEach((room, i) => {
    const img = i % 2 === 0 ? roomImageA : roomImageB;
    db.rooms.updateOne({ _id: room._id }, { $set: { images: [img] } });
    roomsUpdated++;
  });
});

print("Done. Hotels updated: " + hotelsUpdated + ", rooms updated: " + roomsUpdated);