import './db.js';
import express from 'express';
import multer from 'multer';

import bodyParser from 'body-parser';
import morgan from 'morgan';
import session from 'express-session';
import flash from 'express-flash';

// middlewares
import { localsMiddleware } from '../middlewares/localsMiddleware.js';

// routers
import rootRouter from '../routers/rootRouter.js';
import videoRouter from '../routers/videoRouter.js';
import userRouter from '../routers/userRouter.js';
import apiRouter from '../routers/apiRouter.js';

import MongoStore from 'connect-mongo';

const app = express();

// set view engine
app.set("view engine", "pug");
app.set("views", `${process.cwd()}/src/views`);

// middlewares
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('common'));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_HOST,
    })
}));
app.use(flash());
app.use(localsMiddleware);

app.use("/uploads", express.static("uploads"));
app.use("/assets", express.static("assets"));
// routers
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app