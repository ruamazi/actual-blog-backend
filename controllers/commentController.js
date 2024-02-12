import { Comment } from "../models/commentSchema.js";
import { oneMonth } from "../utils/calculateOneMonth.js";
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
  const { isAdmin } = req.user;
  const { startIndex, limit, sort } = req.query;
  if (!isAdmin) {
    return next(errorHandler(401, "Unauthorized"));
  }
  const skipping = parseInt(startIndex) || 0;
  const limitSize = parseInt(limit) || 10;
  const sortDir = sort === "desc" ? 1 : -1;
  try {
    const comments = await Comment.find()
      .sort({ createdAt: sortDir })
      .skip(skipping)
      .limit(limitSize);
    const totalComments = await Comment.countDocuments();
    const oneMonthAgo = oneMonth();
    const lastMonthComments = await Comment.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    return res.status(200).json({ comments, totalComments, lastMonthComments });
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Somthing went wrong"));
  }
};

export const getCommentsByPostId = async (req, res, next) => {
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
  const { _id: userId, isAdmin } = req.user;
  const { commentId } = req.params;
  const { content } = req.body;
  try {
    const comment = await Comment.findById(commentId).select("userId");
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (!isAdmin || comment.userId.toString() !== userId) {
      return next(errorHandler(403, "You cannot edit this comment"));
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
      },
      { new: true }
    );
    res.status(200).json(updatedComment);
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

export const deleteComment = async (req, res, next) => {
  const { _id: userId, isAdmin } = req.user;
  const { commentId } = req.params;
  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      return next(errorHandler(404, "Comment not found"));
    }
    if (!isAdmin || comment.userId.toString() !== userId) {
      return next(errorHandler(403, "You cannot delete this comment"));
    }
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment has been deleted" });
  } catch (err) {
    console.log(err);
    next(errorHandler(500, "Somthing went wrong"));
  }
};
