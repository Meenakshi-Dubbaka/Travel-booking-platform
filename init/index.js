require('dotenv').config({ path: '../.env' });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const MONGO_URL = process.env.ATLASDB_URL;

const geocode = async (location, country) => {
    const query = encodeURIComponent(`${location}, ${country}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;
    
    const res = await fetch(url, {
        headers: { 'User-Agent': 'wanderlust-app' }
    });
    const data = await res.json();
    
    if (data.length > 0) {
        return {
            type: "Point",
            coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
        };
    }
    return { type: "Point", coordinates: [0, 0] };
};

const initDB = async () => {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const user = await User.findOne({ username: "demo" });
    if (!user) {
        console.log("No demo user found!");
        process.exit(1);
    }

    await Listing.deleteMany({});

    let success = 0, failed = 0;

    for (let obj of initData.data) {
        try {
            obj.geometry = await geocode(obj.location, obj.country);
            success++;
        } catch (err) {
            obj.geometry = { type: "Point", coordinates: [0, 0] };
            failed++;
        }
        obj.owner = user._id;
        await new Promise(r => setTimeout(r, 1100));
    }

    await Listing.insertMany(initData.data);
    console.log(`Done!  ${success} geocoded,  ${failed} failed`);
    await mongoose.connection.close();
};

initDB().catch(console.log);