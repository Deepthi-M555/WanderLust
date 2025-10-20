const  express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require('../schema.js');
const Listing = require('../models/listing.js');
const {isLoggedIn} = require('../middleware.js');

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

//New route - show form to create new listing
router.get("/new", isLoggedIn, (req, res)=>{
     res.render("listings/new.ejs");
});

//show route 
router.get("/:id", 
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate('reviews');
    if(!listing){
        req.flash('error', 'Listing doesn not exist!');
        return res.redirect('/listings');
    }
    res.render("listings/show.ejs", {listing});
}));

//Create route - add new listing to DB
router.post("/", isLoggedIn, 
    validateListing, 
    wrapAsync (async(req, res, next)=>{
        const listingData = req.body.listing || req.body;
        const newListing = new Listing(listingData);
        await newListing.save();
        req.flash('success', 'New Listing Created!');
        res.redirect("/listings");
}));

//Edit route - show form to edit a listing
router.get("/:id/edit", isLoggedIn,
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Listing doesn not exist!');
        return res.redirect('/listings');
    }
    res.render("listings/edit.ejs", {listing});
}));

//Update route - update a particular listing
router.put("/:id", isLoggedIn,
    validateListing,
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    req.flash('success', 'Listing Updated!');
    res.redirect(`/listings/${id}`);
}));

//Delete route - delete a particular listing
router.delete("/:id", isLoggedIn, wrapAsync (async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
})
);

module.exports = router;