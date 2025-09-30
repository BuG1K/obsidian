import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  chatId: { type: Number, required: true },
  points: { type: Number, required: false, default: 0 },
  username: { type: String, required: false },
  telegram: { type: String, required: false },
  lvl: { type: Number, required: false, default: 1 },
  balance: { type: Number, required: false, default: 0 },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
