import mongoose from "mongoose";
import bcrypt from "bcrypt";

const sessionSchema = new mongoose.Schema({
    _id: String,
    session: String,
});

const model = mongoose.model('Session', sessionSchema);

export default model