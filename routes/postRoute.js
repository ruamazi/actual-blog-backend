import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
  createPost,
  deletePost,
  getPosts,
  updatePost,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/create", verifyToken, createPost);
router.get("/get-posts", getPosts);
router.get("/delete/:postId", verifyToken, deletePost);
router.put("/update-post/:postId", verifyToken, updatePost);

export default router;
