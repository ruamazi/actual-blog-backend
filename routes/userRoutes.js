import express from "express";
import { deleteUser, test, updateUser } from "../controllers/userController.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.get("/delete/:username", deleteUser);

export default router;
