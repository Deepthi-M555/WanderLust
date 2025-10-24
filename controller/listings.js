const Listing = require("../models/listing");
const opencage = require('opencage-api-client');
const OPENCAGE_API_KEY = process.env.OPENCAGE_API_KEY;

module.exports.index = async(req, res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
};

module.exports.renderNewForm = (req, res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({path : 'reviews'
            , populate : { path : 'author' }
        })
        .populate('owner');
    if(!listing){
        req.flash('error', 'Listing doesn not exist!');
        return res.redirect('/listings');
    }

    if (!listing.geometry || !listing.geometry.coordinates || listing.geometry.coordinates.length === 0) {
    const geoData = await opencage.geocode({
      q: listing.location,
      key: OPENCAGE_API_KEY
    });
    //  Automatically fix missing geometry for old listings
    if (geoData && geoData.results.length > 0) {
      const { lat, lng } = geoData.results[0].geometry;
      listing.geometry = { type: "Point", coordinates: [lng, lat] };
      await listing.save();
      console.log(`✅ Auto-added geometry for: ${listing.title}`);
    }
  }
    console.log(listing);
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async (req, res, next) => {
  try {
    const listingData = req.body.listing || req.body;

    // Geocode using OpenCage API
    const geoData = await opencage.geocode({
      q: listingData.location,
      key: OPENCAGE_API_KEY
    });

    if (!geoData || geoData.results.length === 0) {
      req.flash("error", "Could not find location, please try again.");
      return res.redirect("/listings/new");
    }

    const { lat, lng } = geoData.results[0].geometry;

    const newListing = new Listing(listingData);
    newListing.owner = req.user._id;
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    newListing.geometry = {
      type: "Point",
      coordinates: [lng, lat]
    };

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    next(err);
  }
};


module.exports.renderEditForm = async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash('error', 'Listing doesn not exist!');
        return res.redirect('/listings');
    }

    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace('/upload/', '/upload/h_300,w_250/');
    res.render("listings/edit.ejs", {listing , originalImageUrl});
};

module.exports.updateListing = async(req, res)=>{
        let {id} = req.params;
        let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

        if(typeof req.file !== 'undefined'){
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = {url, filename};
            await listing.save();
        }

        req.flash('success', 'Listing Updated!');
        res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash('success', 'Listing Deleted!');
    res.redirect("/listings");
};