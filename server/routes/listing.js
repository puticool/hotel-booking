const express = require("express");
const multer = require("multer");
const redisClient = require("../config/redis.config").client;
const Listing = require("../models/Listing");
const router = express.Router();

/* -------------------------- File Upload Configuration -------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Prevent overwriting files
  },
});

const upload = multer({ storage });

/* ----------------------------- Create a New Listing ----------------------------- */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    const {
      creator, category, type, streetAddress, aptSuite, city, province, country,
      guestCount, bedroomCount, bedCount, bathroomCount, amenities, title,
      description, highlight, highlightDesc, price,
    } = req.body;

    const listingPhotos = req.files;
    if (!listingPhotos || listingPhotos.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path);

    const newListing = new Listing({
      creator, category, type, streetAddress, aptSuite, city, province, country,
      guestCount, bedroomCount, bedCount, bathroomCount, amenities,
      listingPhotoPaths, title, description, highlight, highlightDesc, price,
    });

    await newListing.save();

    // Invalidate Redis cache for listings
    await redisClient.del("listings");

    res.status(201).json({ message: "Listing created successfully!", listing: newListing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create listing", error: err.message });
  }
});

/* ------------------------ Get Listings (Optional by Category) ------------------------ */
router.get("/", async (req, res) => {
  const { category } = req.query;
  const cacheKey = category ? `listings:category:${category}` : "listings";

  try {
    // Check cache first
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit!");
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log("Cache miss, fetching from database...");
    const query = category ? { category } : {};
    const listings = await Listing.find(query).populate("creator");

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(listings));
    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listings", error: err.message });
  }
});

/* --------------------------- Get Listings by Search Query --------------------------- */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  const cacheKey = `listings:search:${search}`;

  try {
    // Check cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit!");
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log("Cache miss, fetching from database...");
    const listings = search === "all"
      ? await Listing.find().populate("creator")
      : await Listing.find({
          $or: [
            { category: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
          ],
        }).populate("creator");

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(listings));
    res.status(200).json(listings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listings", error: err.message });
  }
});

/* ----------------------------- Get Listing Details ----------------------------- */
router.get("/:listingId", async (req, res) => {
  const { listingId } = req.params;
  const cacheKey = `listing:${listingId}`;

  try {
    // Check cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit!");
      return res.status(200).json(JSON.parse(cachedData));
    }

    console.log("Cache miss, fetching from database...");
    const listing = await Listing.findById(listingId).populate("creator");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    // Cache the result
    await redisClient.setEx(cacheKey, 3600, JSON.stringify(listing));
    res.status(200).json(listing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch listing details", error: err.message });
  }
});

module.exports = router;
