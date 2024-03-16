export const publicOnlyMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        req.flash("error", "Not authorized.");
        return res.redirect("/");
    }
    next();
};

export const loggedInOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        req.flash("error", "Not authorized.");
        return res.redirect("/");
    }
    next();
};

export const passwordLoggedInOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn || req.session.loggedInUser && req.session.loggedInUser.socialOnly) {
        req.flash("error", "Not authorized.");
        return res.redirect("/");
    }
    next();
};