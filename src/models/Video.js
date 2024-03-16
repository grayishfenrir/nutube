import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    video: { type: String, required: true },
    thumbnail: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meta: {
        views: { type: Number, default: 0, requird: true },
        rating: { type: Number, default: 0, required: true },
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
});

const model = mongoose.model('Video', videoSchema);

export default model