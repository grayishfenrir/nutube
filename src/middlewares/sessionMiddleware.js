export const checkAllSessions = (req, res, next) => {
    req.sessionStore.all((error, sessions) => {
        console.log(sessions);
        next();
    })
}