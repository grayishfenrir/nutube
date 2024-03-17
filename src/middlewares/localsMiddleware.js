import { isProd } from "./fileMiddleware.js";

export const localsMiddleware = (req, res, next) => {
    res.locals.siteTitle = "nutube";
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.loggedInUser = req.session.loggedInUser || {};
    res.locals.isProd = isProd;
    next();
};