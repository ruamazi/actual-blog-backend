import { User } from "../models/userSchema.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";

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
