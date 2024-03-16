import express from "express";
import { uploadVideo } from '../middlewares/fileMiddleware.js';
import { publicOnlyMiddleware, loggedInOnlyMiddleware } from '../middlewares/permissionMiddleware.js';
import { getUploadVideo, postUploadVideo, videoDetail, getEditVideo, postEditVideo, deleteVideo } from '../controllers/videoController.js';

const videoRouter = express.Router();

videoRouter.get("/:id([a-z0-9]{24})", videoDetail);
videoRouter.route("/upload").all(loggedInOnlyMiddleware).get(getUploadVideo).post(uploadVideo.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), postUploadVideo);
videoRouter.route("/:id([a-z0-9]{24})/edit").all(loggedInOnlyMiddleware).get(getEditVideo).post(uploadVideo.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), postEditVideo);
videoRouter.get("/:id([a-z0-9]{24})/delete", deleteVideo);

export default videoRouter;