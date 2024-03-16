import Video from '../models/Video.js';

export const home = async (req, res) => {
    const videos = await Video.find({}).populate("owner");
    return res.render("home", { pageTitle: "Home", videos });
};