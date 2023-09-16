import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// jwt is in secs and cookie is in millisecs
const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: maxAge });
};

/* REGISTER USER */
// export const register = async (req, res) => {
//   try {
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       picturePath,
//       friends,
//       location,
//       occupation,
//     } = req.body;

//     const salt = await bcrypt.genSalt();
//     const passwordHash = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       firstName,
//       lastName,
//       email,
//       password: passwordHash,
//       picturePath,
//       friends,
//       location,
//       occupation,
//       viewedProfile: Math.floor(Math.random() * 10000),
//       impressions: Math.floor(Math.random() * 10000),
//     });
//     const savedUser = await newUser.save();
//     res.status(201).json(savedUser);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export async function register(req, res, next) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      picturePath,
      friends,
      location,
      occupation,
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      throw new Error("Ensure you fill all the inputs correctly");
    }

    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: passwordHash,
    });
    await newUser.save();
    const token = createToken(newUser._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    delete newUser.password;
    res.status(200).json({ user: newUser._id });
  } catch (error) {
    console.log(error.message);
    // res.status(422).json({ status: "error", message: error.message });
    next(error);
  }
}

/* LOGGING IN */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) return res.status(400).json({ msg: "User does not exist. " });

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch)
//       return res.status(400).json({ msg: `Invalid credentials ${user}` });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
//     delete user.password;
//     res.status(200).json({ token, user });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export async function login(req, res, next) {
  const { email, password } = req.body;
  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    delete user.password;
    res.status(200).json({ Email: user.email, id: user._id });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  } finally {
    next();
  }
}
