const  express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema } = require('./schema.js');


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() =>{
        console.log('Connected to MongoDB')
    })
    .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res)=>{
    res.send("Hello, Welcome to Wanderlust!");
});

const validateListing = (req, res, next) => {
    let {error}=listingSchema.validate(req.body);
        if(error){
             let errMsg = error.details.map((el) => el.message).join(", ");
            throw new ExpressError(400, errMsg);
        }else{
            next();
        }
    }; 

//Index Route - Show all listings
app.get("/listings", wrapAsync (async(req, res)=>{
   const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//new route - show form to create new listing
app.get("/listings/new", (req, res)=>{
    res.render("listings/new.ejs");
});

//show route 
app.get("/listings/:id", wrapAsync (async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing});
}));

//Create route - add new listing to DB
app.post("/listings", 
    validateListing,
    wrapAsync (async(req, res, next)=>{
        const listingData = req.body.listing || req.body;
        const newListing = new Listing(listingData);
        await newListing.save();
        res.redirect("/listings");
}));

//Edit route - show form to edit a listing
app.get("/listings/:id/edit", wrapAsync (async(req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
}));

//Update route - update a particular listing
app.put("/listings/:id", 
    validateListing,
    wrapAsync (async(req, res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete route - delete a particular listing
app.delete("/listings/:id", wrapAsync (async(req, res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// app.get("/testListing", async (req, res)=>{
//     let sampleListing = new Listing({
//         title: "Beautiful Beach House",
//         description: "A lovely beach house with stunning ocean views.",
//         price: 1500,
//         location: "Malpe, Karnataka",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("Sample listing saved");
//     res.send("Testing successful");
// });


app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// error handling middleware
app.use((err,req,res,next)=>{
    let{statusCode=500, message="Something went wrong"} = err;
    res.status(statusCode).render("listings/error.ejs",{message});
});

app.listen(8080, ()=>{
  console.log("Server is listening on port 8080");
});