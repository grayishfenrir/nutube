import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, requried: true },
    password: { type: String },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    socialOnly: Boolean,
    avatar: String,
});

userSchema.pre('save', async function () {
    if (this.password && this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, Number(process.env.DEFAULT_SALT))
    }
}
);

userSchema.static('hashPassword'), async function (password) {
    return await bcrypt.hash(this.password, Number(process.env.DEFAULT_SALT))
}

const model = mongoose.model('User', userSchema);

export default model