import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createComment,
  getComments,
  likeComment,
  updateComment,
} from "../controllers/commentController.js";

const router = express.Router();

router.post("/create", verifyToken, createComment);
router.get("/get-comments/:postId", getComments);
router.put("/edit/:commentId", verifyToken, updateComment);
router.put("/like/:commentId", verifyToken, likeComment);

export default router;
