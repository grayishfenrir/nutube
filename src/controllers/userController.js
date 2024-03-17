import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import Session from '../models/Session.js';
import User from '../models/User.js';

export const getJoin = (req, res) => {
    return res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res) => {
    const { email, name, password, confirm_password } = req.body;

    const exists = await User.exists({ email });

    if (exists) {
        // user exists
        return res.status(400).render("join", { pageTitle: "Join", error: "This email is already taken.", email, name })
    }

    if (password !== confirm_password) {
        // password not matched
        return res.status(400).render("join", { pageTitle: "Join", error: "Password and Confirm Password are not matched.", email, name })
    }

    try {
        await User.create({
            email,
            name,
            password,
            socialOnly: false,
        });
    } catch (e) {
        return res.status(500).render("join", { pageTitle: "Join", error: `Fail to create user. ${e._message}`, email, name })
    }

    // success join
    return res.redirect("/login");
};

export const getLogin = (req, res) => {
    return res.render("login", { pageTitle: "Login" });
};

export const postLogin = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        // user not exists
        return res.status(400).render("login", { pageTitle: "Login", error: "incorrect user name or password", email })
    }

    if (user.socialOnly) {
        // social only id
        return res.status(400).render("login", { pageTitle: "Login", error: "This email can social login only", email })
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        // password not matched
        return res.status(400).render("login", { pageTitle: "Login", error: "incorrect user name or password", email })
    }

    // success login
    req.session.loggedIn = true;
    req.session.loggedInUser = user;
    return res.redirect("/");
};

export const logout = async (req, res) => {
    const { id: sessionId,
        loggedInUser: { email } } = req.session;

    console.log(req.session);


    try {
        // TODO: Check all logout.
        if (email) {
            console.log("fail?");
            await Session.deleteMany({ session: new RegExp(email) });
            console.log("fail");
        } else {
            req.session.destroy();
        }
    } catch (e) {
        console.log(`Error occrred in logout, id: ${sessionId}, email: ${email}, ${e._message}`);
    }
    return res.redirect("/");
};

export const gitHubLogin = (req, res) => {
    const githubAuthUrl = `${process.env.GITHUB_BASE_URL}/login/oauth/authorize`
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        scope: "read:user user:email",
    })

    return res.redirect(`${githubAuthUrl}?${params}`);
};

export const handleGitHubCallback = async (req, res) => {
    const { code } = req.query;
    const githubAuthUrl = `${process.env.GITHUB_BASE_URL}/login/oauth/access_token`;
    const params = new URLSearchParams({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_SECRET,
        code
    });

    const tokenResponse = await (
        await fetch(`${githubAuthUrl}?${params}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
            }
        }
        )
    ).json();


    if ("access_token" in tokenResponse) {
        // login by gitgub
        const { access_token } = tokenResponse;
        const userResponse = await (
            await fetch(`${process.env.GITHUB_API_BASE_URL}/user`, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${access_token}`,
                },
            }
            )
        ).json();

        const emailResponse = await (
            await fetch(`${process.env.GITHUB_API_BASE_URL}/user/emails`, {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${access_token}`,
                },
            }
            )
        ).json();

        const mainEmail = emailResponse.find((emailResponse) => emailResponse.primary && emailResponse.verified);

        const existingUser = await User.findOne({ email: mainEmail.email });
        if (existingUser) {
            req.session.loggedIn = true;
            req.session.loggedInUser = existingUser;
            return res.redirect('/')
        } else {
            try {
                const user = await User.create({
                    email: mainEmail.email,
                    name: userResponse.name ? userResponse.name : userResponse.login,
                    socialOnly: true,
                    avatar: userResponse.avatar_url,
                })
                req.session.loggedIn = true;
                req.session.loggedInUser = user;
            } catch (e) {
                return res.status(500).render("login", { pageTitle: "Login", error: `Fail to login. ${e._message}` });
            }

            return res.redirect('/');
        }
    }

    // fail to login
    return res.redirect('/login');
};

export const getEditProfile = (req, res) => {
    return res.render("users/editProfile", { pageTitle: "Edit Profile" });

}

export const postEditProfile = async (req, res) => {
    const { session: {
        loggedInUser: {
            _id: loggedInUserId,
            avatar,
        }
    },
        body: { email, name },
        file } = req;

    const emailChanged = email !== req.session.loggedInUser.email;

    if (emailChanged) {
        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).render("users/editProfile", { pageTitle: "Edit Profile", error: "This email is already taken.", name })
        }
    }

    const updatedUser = await User.findByIdAndUpdate(loggedInUserId, {
        ...req.session.loggedInUser,
        email,
        name,
        avatar: file ? file.location : avatar
    }, {
        new: true,
    });

    // delete existing login sessions.
    if (emailChanged) {
        try {
            await Session.deleteMany({ _id: { $ne: req.session.id }, session: { $regex: req.session.loggedInUser.email } });
        } catch (e) {
            return res.status(500).render("users/editProfile", { pageTitle: "Edit Profile", error: `${e._message}`, email, name })
        }
    }

    req.session.loggedInUser = updatedUser;

    return res.render("users/editProfile", { pageTitle: "Edit Profile" });
}

export const getEditPassword = (req, res) => {
    return res.render("users/editPassword", { pageTitle: `Edit Password` })
}

export const postEditPassword = async (req, res) => {
    const { prev_password, new_password, new_password_confirm } = req.body;

    const user = await User.findById(req.session.loggedInUser._id);

    if (!user) {
        req.session.destroy();
        await Session.deleteMany({ _id: { $ne: req.session.id }, session: new RegExp(user.email) });
        return res.redirect("/");
    }

    const match = await bcrypt.compare(prev_password, user.password);

    if (!match) {
        return res.status(400).render("users/editPassword", { pageTitle: "Edit Profile", error: "incorrect password." })
    }

    if (new_password !== new_password_confirm) {
        return res.status(400).render("users/editPassword", { pageTitle: "Edit Profile", error: "New Password and Confirm Password are not matched." })
    }

    user.password = new_password;
    await user.save();

    const savedUser = await User.findById(user.id);

    req.session.loggedInUser = savedUser;

    try {
        await Session.deleteMany({ _id: { $ne: req.session.id }, session: new RegExp(user.email) });
    } catch (e) {
        return res.status(500).render("users/editProfile", { pageTitle: "Edit Profile", error: `${e._message}` })
    }

    return res.redirect("/users/edit-profile")
}

export const meDetail = async (req, res) => {
    const user = await User.findById(req.session.loggedInUser._id).populate({
        path: "videos",
        populate: {
            path: "owner",
            model: "User",
        },
    });
    return res.render("users/meDetail", { pageTitle: `${user.name}'s Profile`, user });
}

export const userDetail = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).populate({
            path: "videos",
            populate: {
                path: "owner",
                model: "User",
            },
        });
        if (user) {
            return res.render("users/userDetail", { pageTitle: `${user.name}'s Profile`, user });
        } else {
            return res.redirect("/");
        }
    } catch {
        return res.redirect("/");
    }
}