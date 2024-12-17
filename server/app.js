const express = require("express");
const app = express();
const { connectDB } = require('./config/db');
require('dotenv').config();
const cors = require("cors");
const morgan = require('morgan');
const axios = require('axios');
const { connectRedis, client } = require("./config/redis.config")

const authRoutes = require("./routes/auth.js")
const listingRoutes = require("./routes/listing.js")
const bookingRoutes = require("./routes/booking.js")
const userRoutes = require("./routes/user.js")

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static("public"));

// Connect to DB
connectDB();
connectRedis();

app.get("/photos", async (req, res) => {
  try {
      const { albumId } = req.query;

      if (!albumId) {
          return res.status(400).json({ message: "albumId is required" });
      }

      const redisKey = `photos:album:${albumId}`;

      // Kiểm tra Redis cache
      const cachedData = await client.get(redisKey);
      if (cachedData) {
          console.log("Data fetched from Redis Cache");
          return res.status(200).json(JSON.parse(cachedData));
      }

      // Fetch từ API nếu không có trong Redis
      const { data } = await axios.get("https://jsonplaceholder.typicode.com/photos", {
          params: { albumId },
      });

      // Cache dữ liệu trong Redis (1 giờ)
      await client.setEx(redisKey, 3600, JSON.stringify(data));

      console.log("Data fetched from API and cached in Redis");
      res.status(200).json(data);
  } catch (error) {
      console.error("Error fetching photos:", error.message);
      res.status(500).json({ message: "Error fetching photos", error: error.message });
  }
});


/* ROUTES */
app.use("/auth", authRoutes)
app.use("/properties", listingRoutes)
app.use("/bookings", bookingRoutes)
app.use("/users", userRoutes)

module.exports = app;

