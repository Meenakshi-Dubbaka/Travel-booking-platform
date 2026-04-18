const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
require('dotenv').config({ path: '../.env' });

const MONGO_URL = process.env.ATLASDB_URL;;

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

const initDB = async () => {
  await Listing.deleteMany({});

  for (let obj of initData.data) {
    
    // ✅ Set default coordinates (Hyderabad or any place)
    obj.geometry = {
      type: "Point",
      coordinates: [78.486671, 17.385044], // [lng, lat]
    };

    // ✅ Set owner
    obj.owner = "685903926a34fc015d0d07d5";
  }

  await Listing.insertMany(initData.data);
  console.log("Database initialized successfully.");
};

