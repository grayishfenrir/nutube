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

    // TODO: make thumbnail automatically

    const video = await Video.create({
        title,
        description,
        video: videoFile[0].location,
        thumbnail: thumbnailFile[0].location,
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
    existingVideo.video = videoFile ? videoFile[0].location : existingVideo.video;
    existingVideo.thumbnail = thumbnailFile ? thumbnailFile[0].location : existingVideo.thumbnail;
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

    return res.status(201).json({ newCommentId: comment.id });
};

export const deleteComment = async (req, res) => {
    const {
        params: { id },
        session: {
            loggedInUser:
            {
                _id: userId,
            },
        },
    } = req;

    const comment = await Comment.findById(id);
    if (!comment) {
        return res.sendStatus(404);
    }

    console.log(comment.id);
    const video = await Video.findById(comment.video);
    if (!video) {
        return res.sendStatus(404);
    }

    if (comment.owner.toString() !== userId) {
        req.flash("error", "Not Authorize.")
        return res.sendStatus(400);
    }

    const newUser = await User.findById(userId);

    const user = await User.findByIdAndUpdate(userId, {
        $pull: { comments: comment.id }
    },
        { new: true }
    );

    video.comments.pull(comment);

    await video.save();

    return res.sendStatus(200);
};