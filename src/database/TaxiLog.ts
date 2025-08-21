import mongoose from "mongoose";

const TaxiLogSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  orderId: { type: String, required: true },
  callType: { type: String, required: true },
}, { timestamps: true });

const TaxiLog = mongoose.models.TaxiLog || mongoose.model("TaxiLog", TaxiLogSchema);

export default TaxiLog;
