import express from "express";
import {
  deleteUser,
  getUsers,
  signOut,
  updateRole,
  updateUser,
} from "../controllers/userController.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.get("/sign-out", signOut);
router.get("/update-role/:id", updateRole);
router.get("/get-users", verifyToken, getUsers);

export default router;
