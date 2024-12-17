const redis = require("redis");

const client = redis.createClient();

client.on("error", (err) => console.log("Redis connection error:", err));
client.on("connect", () => console.log("Redis client connected"));
client.on("ready", () => console.log("Redis client ready for use"));

const connectRedis = async () => {
    try {
        await client.connect();
        console.log("Redis connected successfully");
    } catch (err) {
        console.error("Error connecting to Redis:", err.message);
    }
};

module.exports = { connectRedis, client };
