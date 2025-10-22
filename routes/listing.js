const  express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require('../models/listing.js');
const {isLoggedIn, isOwner, validateListing} = require('../middleware.js');
const listingController = require('../controller/listings.js');
const multer = require('multer');
const { storage } = require('../cloudConfig.js');
const upload = multer({ storage });

router
    .route("/")
    .get(wrapAsync (listingController.index)) //Index Route - Show all listings 
    //Create route - add new listing to DB
    .post(isLoggedIn,  
        upload.single('listing[image]'),
        validateListing,
        wrapAsync (listingController.createListing)
    );
    
//New route - show form to create new listing
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
    .route("/:id")
    .get(wrapAsync (listingController.showListing)) //show route 
    .put(isLoggedIn,
        isOwner,
        upload.single('listing[image]'),
        validateListing,
        wrapAsync (listingController.updateListing)) //Update route - update a particular listing
    .delete(isLoggedIn,
        isOwner,
        wrapAsync (listingController.destroyListing)
    );//Delete route - delete a particular listing

//Edit route - show form to edit a listing
router.get("/:id/edit", 
    isLoggedIn,
    isOwner,
    wrapAsync (listingController.renderEditForm));

module.exports = router;