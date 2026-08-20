const mongoose = require("mongoose");

const startServer = require("./server");

require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to MongoDB...");

const start = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("connected to MongoDB");
  await startServer(process.env.PORT || 4000);
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exitCode = 1;
});
