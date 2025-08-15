import mongoose from "mongoose";

let isConnected = false;
const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "";

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB,
    });
    isConnected = true;

    // eslint-disable-next-line no-console
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ MongoDB connection error:", err);

    throw err;
  }
};

export default connectDB;
