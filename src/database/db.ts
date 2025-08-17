// lib/mongodb.js
import mongoose from "mongoose";

let isConnected = false;

export default async function connectDB() {
  if (isConnected) return;

  if (!process.env.MONGODB_URI) {
    throw new Error("Please add MONGODB_URI to your environment variables");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "mydb",
    });
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error", err);
    throw err;
  }
}
