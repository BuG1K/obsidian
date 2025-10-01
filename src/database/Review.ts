import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const Review = mongoose.models.Review || mongoose.model("Review", ReviewSchema);

export default Review;
