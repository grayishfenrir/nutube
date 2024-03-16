import express from "express";
import { home } from "../controllers/rootController.js";
import { getJoin, postJoin, getLogin, postLogin, logout } from "../controllers/userController.js";
// import {  } from "../controllers/videoController.js";
import { publicOnlyMiddleware, loggedInOnlyMiddleware } from "../middlewares/permissionMiddleware.js";

const rootRouter = express.Router();

rootRouter.get('/', home);
rootRouter.route('/join').all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter.route('/login').all(publicOnlyMiddleware).get(getLogin).post(postLogin);
rootRouter.get('/logout', loggedInOnlyMiddleware, logout);
// rootRouter.get('/new', videoController.new);
// rootRouter.get('/join', userController.join);

export default rootRouter;