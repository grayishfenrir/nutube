import express from 'express';
import { uploadProfile } from '../middlewares/fileMiddleware.js';
import { publicOnlyMiddleware, loggedInOnlyMiddleware, passwordLoggedInOnlyMiddleware } from '../middlewares/permissionMiddleware.js';
import { gitHubLogin, handleGitHubCallback, getEditProfile, postEditProfile, getEditPassword, postEditPassword, meDetail, userDetail } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/github/start', gitHubLogin);
userRouter.get('/github/callback', handleGitHubCallback);
userRouter.route('/edit-profile').all(loggedInOnlyMiddleware).get(getEditProfile).post(uploadProfile.single('avatar'), postEditProfile);
userRouter.route('/edit-password').all(passwordLoggedInOnlyMiddleware).get(getEditPassword).post(postEditPassword);
userRouter.get('/my-profile', loggedInOnlyMiddleware, meDetail);
userRouter.get('/:id([a-z0-9]{24})', userDetail);

export default userRouter;