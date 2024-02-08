import { User } from "../models/userSchema.js";
import { oneMonth } from "../utils/calculateOneMonth.js";
import { errorHandler } from "../utils/error.js";
import { passwordRegex, usernameRegex } from "./authController.js";
import bcyptjs from "bcryptjs";

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return next(errorHandler(404, "user not found"));
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

export async function signOut(req, res, next) {
  try {
    return res
      .clearCookie("token")
      .status(200)
      .json("User has been signed out.");
  } catch (err) {
    console.log(err);
    next(err);
  }
}

export const updateRole = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return;
    }
    user.isAdmin = true;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    console.log(err);
    return next(errorHandler(500, "Somthing went wrong"));
  }
};

export const getUsers = async (req, res, next) => {
  const { isAdmin } = req.user;
  const { startIndex } = req.query || 0;
  const { limit } = req.query || 10;
  const sortDirection = req.query.sort === "asc" ? 1 : -1;
  if (!isAdmin) {
    return next(errorHandler(403, "Unauthorized"));
  }
  try {
    const users = await User.find()
      .sort({ createdAt: sortDirection })
      .skip(startIndex)
      .limit(limit)
      .select("-password");
    const totalUsers = await User.countDocuments();
    const oneMonthAgo = oneMonth();
    const lastMonthUsers = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    return res.status(200).json({
      users,
      totalUsers,
      lastMonthUsers,
    });
  } catch (err) {
    console.log(err);
    return next(errorHandler(500, "Somthing went wrong"));
  }
};
