import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}
);

const db = mongoose.connection;

const handleOpen = () => console.log("Connected to DB🆒");
db.on("error", (error) => console.log("DB error❌", error));
db.once("open", handleOpen);