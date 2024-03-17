import Video from '../models/Video.js';

export const home = async (req, res) => {
    const { query: { keyword } } = req;
    let videos = [];
    if (keyword) {
        videos = await Video.find({ title: new RegExp(keyword, 'i') }).populate("owner");
    } else {
        videos = await Video.find({}).populate("owner");
    }
    return res.render("home", { pageTitle: "Home", videos });
};