import express from "express";
import { deleteUser, test } from "../controllers/userController.js";

const router = express.Router();

router.get("/test", test);
router.get("/delete/:username", deleteUser);

export default router;
