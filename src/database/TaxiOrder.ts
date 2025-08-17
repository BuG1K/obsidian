import mongoose from "mongoose";

const TaxiOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  orderId: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
}, { timestamps: true });

const TaxiOrder = mongoose.models.TaxiOrder || mongoose.model("TaxiOrder", TaxiOrderSchema);

export default TaxiOrder;
