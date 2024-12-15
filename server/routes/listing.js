const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User")

const redis = require("redis");
const client = redis.createClient();

client.connect()
/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });

/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take the information from the form */
    const {
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files

    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.")
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path)

    const newListing = new Listing({
      creator,
      category,
      type,
      streetAddress,
      aptSuite,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    })

    await newListing.save()

    res.status(200).json(newListing)
  } catch (err) {
    res.status(409).json({ message: "Fail to create Listing", error: err.message })
    console.log(err)
  }
});

/* GET lISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category

  try {
    let listings
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate("creator")
    } else {
      listings = await Listing.find().populate("creator")
    }

    res.status(200).json(listings)
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch listings", error: err.message })
    console.log(err)
  }
})

/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params;
  const page = parseInt(req.query.page) || 1; // Trang hiện tại, mặc định là 1
  const limit = parseInt(req.query.limit) || 10; // Số mục trên mỗi trang, mặc định là 10
  const skip = (page - 1) * limit; // Bỏ qua số mục trước đó

  // Key cache bao gồm cả `search` và `page` để phân biệt cache giữa các trang
  const cacheKey = `search:${search}:page:${page}`;

  try {
    // Kiểm tra trong Redis Cache
    const cachedData = await client.get(cacheKey);
    if (cachedData) {
      console.log("Data from cache");
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Nếu không có cache, truy vấn từ database
    const query = search === "all" 
      ? {} // Nếu search là "all", lấy toàn bộ
      : { 
          $or: [ 
            { title: { $regex: search, $options: "i" } },
            { city: { $regex: search, $options: "i" } }
          ]
        };

    const listings = await Listing.find(query)
      .skip(skip) // Bỏ qua các mục trước đó
      .limit(limit) // Giới hạn số lượng mục trả về
      .select("title city price") // Chỉ trả về các trường cần thiết
      .exec();

    const total = await Listing.countDocuments(query); // Tổng số mục khớp với truy vấn

    const response = {
      total, // Tổng số mục
      page, // Trang hiện tại
      limit, // Số mục mỗi trang
      totalPages: Math.ceil(total / limit), // Tổng số trang
      listings, // Dữ liệu danh sách
    };

    // Lưu kết quả vào cache Redis
    await client.setEx(cacheKey, 3600, JSON.stringify(response)); // Cache trong 1 giờ

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({ message: "Fail to fetch listings", error: err.message });
  }
});




/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params
    const listing = await Listing.findById(listingId).populate("creator")
    res.status(202).json(listing)
  } catch (err) {
    res.status(404).json({ message: "Listing can not found!", error: err.message })
  }
})

module.exports = router
