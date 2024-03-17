import express from "express";

import { registerView, createComment, deleteComment } from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([a-z0-9]{24})/views", registerView);
apiRouter.post("/videos/:id([a-z0-9]{24})/comments", createComment);
apiRouter.delete("/comments/:id([a-z0-9]{24})", deleteComment);

export default apiRouter;