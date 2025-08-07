const mongoose = require("mongoose");
const axios = require("axios");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});

 for (let obj of initData.data) {
  try {
    // Geocode the location
    const response = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: {
        q: obj.location,
        format: "json",
        limit: 1,
      },
      headers: {
        "User-Agent": process.env.NOMINATIM_USER_AGENT || "your@email.com",
      },
    });

    if (response.data && response.data.length > 0) {
      const geo = response.data[0];
      obj.geometry = {
        type: "Point",
        coordinates: [parseFloat(geo.lon), parseFloat(geo.lat)],
      };
    } else {
      console.warn(`No geocode result for ${obj.location}`);
      obj.geometry = {
        type: "Point",
        coordinates: [0, 0],
      };
    }

    obj.owner = "685903926a34fc015d0d07d5";

   
  } catch (err) {
    console.error(`Error geocoding ${obj.location}:`, err.message);
    obj.geometry = {
      type: "Point",
      coordinates: [0, 0],
    };

  
    obj.owner = "685903926a34fc015d0d07d5";
  }
}


  await Listing.insertMany(initData.data);
  console.log("Database initialized successfully.");
};

initDB();



