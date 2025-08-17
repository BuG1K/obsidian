import mongoose from "mongoose";

const TaxiUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  chatId: { type: Number, required: true },
}, { timestamps: true });

const TaxiUser = mongoose.models.TaxiUser || mongoose.model("TaxiUser", TaxiUserSchema);

export default TaxiUser;
