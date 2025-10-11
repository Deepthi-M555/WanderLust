const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        type: String,
        default: "https://wallpaperaccess.com/full/1194086.jpg",   
        set: (v) => v ===""? "https://wallpaperaccess.com/full/1194086.jpg": v,  
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;