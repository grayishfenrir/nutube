import Video from '../models/Video.js';
import User from '../models/User.js';
import Comment from "../models/Comment.js";

export const getUploadVideo = async (req, res) => {
    return res.render("videos/uploadVideo", { pageTitle: "Upload Video" });
};

export const postUploadVideo = async (req, res) => {
    const { body: { title, description }, files: { video: videoFile, thumbnail: thumbnailFile } } = req;

    if (!videoFile || !title || !description) {
        return res.status(400).render("videos/uploadVideo", { pageTitle: "Upload Video", error: "Please fill all components", title, description })
    }

    const video = await Video.create({
        title,
        description,
        video: `/${videoFile[0].path}`,
        thumbnail: `/${thumbnailFile[0].path}`,
        owner: req.session.loggedInUser._id,
    })

    const user = await User.findById(req.session.loggedInUser._id);
    user.videos.push(video.id);
    await user.save()

    return res.redirect(`/videos/${video.id}`);
};

export const videoDetail = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if (video) {
        return res.render(`videos/videoDetail`, { pageTitle: video.title, video });
    } else {
        return res.redirect("/");
    }
};

export const getEditVideo = async (req, res) => {
    const { id: videoId } = req.params;
    const video = await Video.findById(videoId);

    if (req.session.loggedInUser && video && String(video.owner) === String(req.session.loggedInUser._id)) {
        return res.render("videos/editVideo", { pageTitle: "Edit Vedio", video });
    } else {
        return res.redirect(`/videos/${video.id}`)
    }
};


export const postEditVideo = async (req, res) => {
    const { params: { id: videoId }, body: { title, description }, files: { video: videoFile, thumbnail: thumbnailFile } } = req;

    if (!title || !description) {
        return res.status(400).redirect(`/videos/${videoId}/edit`);
    }

    const existingVideo = await Video.findById(videoId).populate("owner").populate("comments");

    if (!existingVideo || !req.session.loggedInUser || String(existingVideo.owner.id) !== String(req.session.loggedInUser._id)) {
        return res.status(400).redirect(`/videos/${videoId}`);
    }

    existingVideo.title = title;
    existingVideo.description = description;
    existingVideo.video = videoFile[0] ? `/${videoFile[0].path}` : existingVideo.video;
    existingVideo.thumbnail = thumbnailFile[0] ? `/${thumbnailFile[0].path}` : existingVideo.thumbnail;
    existingVideo.updatedAt = Date.now()

    await existingVideo.save();

    return res.redirect(`/videos/${videoId}`);
};

export const deleteVideo = async (req, res) => {
    const { id: videoId } = req.params;
    const video = await Video.findById(videoId);
    if (video && String(video.owner) === String(req.session.loggedInUser._id)) {
        video.delete();
    }
    return res.redirect("/");
};

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};

export const createComment = async (req, res) => {
    const {
        params: { id },
        body: { text },
        session: {
            loggedInUser:
            {
                _id: userId,
            },
        },
    } = req;

    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }

    const comment = await Comment.create({
        text,
        owner: userId,
        video: id,
    });

    const user = await User.findByIdAndUpdate(userId, {
        $push: { comments: comment }
    },
        { new: true }
    );

    video.comments.push(comment);
    await video.save();

    return res.sendStatus(201).json({ newCommentId: comment.id });
};