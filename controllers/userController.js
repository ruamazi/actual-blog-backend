import { User } from "../models/userSchema.js";
import { errorHandler } from "../utils/error.js";
import { passwordRegex, usernameRegex } from "./authController.js";
import bcyptjs from "bcryptjs";

export const test = (req, res) => {
  res.json({ message: "zab" });
};

export const deleteUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOneAndDelete({ username });
    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }
    return res.status(200).json({ success: "user deleted" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
};

export const updateUser = async (req, res, next) => {
  const userId = req.user._id;
  const userParamId = req.params.userId;
  const { password, username, email, profilePic } = req.body;
  if (userId !== userParamId) {
    return next(errorHandler(403, "You are not allowed to update this user."));
  }
  if (password && !passwordRegex.test(password)) {
    return next(
      errorHandler(
        400,
        "Password should contain at least one lowercase letter, one uppercase letter,one digit one special character from the set @$!%*?&."
      )
    );
  }
  let hashedPsw;
  if (password) {
    hashedPsw = bcyptjs.hashSync(password, 8);
  }
  if (username && !usernameRegex.test(username)) {
    return next(errorHandler(400, "Invalid username format"));
  }
  const usernameTken = await User.findOne({ username });
  if (usernameTken && usernameTken._id.toString() !== userParamId) {
    return next(errorHandler(404, "User name taken"));
  }
  try {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username,
          email,
          profilePic,
          password,
        },
      },
      { new: true }
    );
    const { password: psw, ...rest } = updateUser._doc;
    return res.status(200).json(rest);
  } catch (err) {
    console.log(err);
    return next(err);
  }
};
