const  express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');


const validateListing = (req, res, next) => {
    let {error}=listingSchema.validate(req.body);
        if(error){
             let errMsg = error.details.map((el) => el.message).join(", ");
             throw new ExpressError(400, errMsg);
        }
        else{
            next();
        }
}; 

//Index Route - Show all listings
router.get("/", 
    wrapAsync (async(req, res)=>{
   const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new route - show form to create new listing
router.get("/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//show route 
router.get("/:id", 
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    res.render("listings/show.ejs", {listing});
}));

//Create route - add new listing to DB
router.post("/", 
    validateListing,
    wrapAsync (async(req, res, next)=>{
        const listingData = req.body.listing || req.body;
        const newListing = new Listing(listingData);
        await newListing.save();
        res.redirect("/listings");
}));

//Edit route - show form to edit a listing
router.get("/:id/edit", 
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update route - update a particular listing
router.put("/:id", 
    validateListing,
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete route - delete a particular listing
router.delete("/:id", wrapAsync (async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
})
);

module.exports = router;