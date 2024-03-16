import express from "express";

import { registerView, createComment } from "../controllers/videoController.js";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([a-z0-9]{24})/views", registerView);
apiRouter.post("/videos/:id([a-z0-9]{24})/comments", createComment);

export default apiRouter;