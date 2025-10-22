const  express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const Review = require('../models/review.js');
const Listing = require('../models/listing.js');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware.js');
const reviewController = require('../controller/review.js');

// Post route to add a review for a listing
router.post("/",
    isLoggedIn,
    validateReview, 
    wrapAsync(reviewController.createReview) );

// Delete Review route 
router.delete(
    "/:reviewId", 
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview) );

module.exports = router;