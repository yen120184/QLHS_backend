import mongoose from "mongoose";
import IUser from "./users.interface";

const UserSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  permission: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IUser & mongoose.Document>("user", UserSchema);
