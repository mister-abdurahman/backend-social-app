import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import fetchNoCors from "fetch-no-cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "../routes/auth.js";
import userRoutes from "../routes/users.js";
import postRoutes from "../routes/posts.js";
import { register } from "../controllers/auth.js";
import { createPost } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";
import User from "../models/User.js";
import Post from "../models/Post.js";
import { users, posts } from "../data/index.js";

dotenv.config();

/* CONFIGURATIONS */
const __filename = fileURLToPath(import.meta.url);
const __theDirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use(cors());
var corsOptions = {
  origin: "https://relaxed-scone-3e19fa.netlify.app/",
  optionsSuccessStatus: 200,
};

app.use(
  "/assets",
  cors(corsOptions),
  express.static(path.join(__theDirname, "public/assets"))
);

/* FILE STORAGE */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/assets");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

/* ROUTES WITH FILES */
app.post(
  "/auth/register",
  cors(corsOptions),
  upload.single("picture"),
  register
);
app.post(
  "/posts",
  cors(corsOptions),
  verifyToken,
  upload.single("picture"),
  createPost
);

/* ROUTES */
app.get("/", cors(corsOptions), (req, res) => {
  res.status(200).send("Welcome.!");
});
app.use("/auth", cors(corsOptions), authRoutes);
app.use("/users", cors(corsOptions), userRoutes);
app.use("/posts", cors(corsOptions), postRoutes);

// Serving the front End
app.use(
  express.static(path.join(__dirname, "./client/build"), cors(corsOptions))
);

//Set static folder
// app.use(express.static("client/build"));

app.get("*", cors(corsOptions), function (_, res) {
  res.sendFile(
    path.join(__dirname, "./client/build/index.html"),
    function (err) {
      res.status(500).send(err);
    }
  );
});

// app.get("*", (_, res) => {
//   res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
// });

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3000;

mongoose.set("strictQuery", false);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
