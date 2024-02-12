import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createComment,
  deleteComment,
  getComments,
  getCommentsByPostId,
  likeComment,
  updateComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/create", verifyToken, createComment);
router.get("/get-comments/:postId", getCommentsByPostId);
router.get("/get-comments", verifyToken, getComments);
router.put("/edit/:commentId", verifyToken, updateComment);
router.put("/like/:commentId", verifyToken, likeComment);
router.delete("/delete/:commentId", verifyToken, deleteComment);

export default router;
