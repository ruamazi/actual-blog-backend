import { Comment } from "../models/commentSchema.js";
import { errorHandler } from "../utils/error.js";

export const createComment = async (req, res, next) => {
  const { _id } = req.user;
  const { content, postId, userId } = req.body;
  if (userId !== _id) {
    return next(errorHandler(403, "Make sure you are logged in"));
  }
  try {
    const newComment = new Comment({
      content,
      postId,
      userId,
    });
    await newComment.save();
    await newComment.populate("userId", "-_id username profilePic");
    return res.status(200).json(newComment);
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Somthing went wrong"));
  }
};

export const getComments = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const posts = await Comment.find({ postId })
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePic -_id");
    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Somthing went wrong"));
  }
};

export const updateComment = async (req, res, next) => {
  const { commentId } = req.params;
  try {
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Somthing went wrong"));
  }
};

export const likeComment = async (req, res, next) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    const userIndex = comment.likes.indexOf(userId);
    if (userIndex === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(userIndex, 1);
    }
    await comment.save();
    await comment.populate("userId", "username profilePic -_id");
    return res.status(200).json(comment);
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Somthing went wrong"));
  }
};
