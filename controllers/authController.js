import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res, next) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
  const { username, email, password } = req.body;
  if (
    !username ||
    !email ||
    !password ||
    username.trim().length === 0 ||
    email.trim().length === 0 ||
    password.trim().length === 0
  ) {
    return next(errorHandler(400, "All feilds are required"));
  }
  if (!passwordRegex.test(password)) {
    return next(errorHandler(400, "Invalid password."));
  }
  const useExist = await User.findOne({ username });
  if (useExist) {
    return next(errorHandler(400, "Username is taken"));
  }
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return next(
      errorHandler(400, "This email is already registered, sign in now")
    );
  }
  const hashedPsw = bcryptjs.hashSync(password, 8);
  try {
    const newUser = new User({
      username,
      password: hashedPsw,
      email,
    });
    await newUser.save();
    return res.status(200).json({ success: true, message: "User created." });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next(errorHandler(400, "All fields are required"));
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return next(errorHandler(400, "Wrong credentials."));
    }
    const validPasswor = bcryptjs.compareSync(password, user.password);
    if (!validPasswor) {
      return next(errorHandler(400, "Wrong credentials."));
    }
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.SEC
    );
    const { password: psw, ...userWithoutPsw } = user._doc;
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
      })
      .json(userWithoutPsw);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};

export const googleAuth = async (req, res, next) => {
  const { email, name, googlePhotoUrl } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.SEC);
      const { password, ...rest } = user._doc;
      res
        .status(200)
        .cookie("token", token, {
          httpOnly: true,
        })
        .json(rest);
    }
    const uniqueUsername =
      name.toLowerCase().split(" ").join("") +
      Math.random().toString(9).slice(-4);
    const generatePsw =
      Math.random().toString(36).slice(-8) +
      Math.random().toString(36).slice(-8);
    const hashedPsw = bcryptjs.hashSync(generatePsw, 8);
    const newUser = new User({
      username: uniqueUsername,
      password: hashedPsw,
      email,
      profilePic: googlePhotoUrl,
    });
    await newUser.save();
    const { password, ...rest } = newUser._doc;
    const token = jwt.sign({ _id: newUser._id }, process.env.SEC);
    res
      .status(200)
      .cookie("token", token, {
        httpOnly: true,
      })
      .json(rest);
  } catch (err) {
    console.log(err);
    next(err);
  }
};
