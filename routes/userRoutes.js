import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
} from "../controller/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";
const router = express.Router();

//  Added Middleware For multer
router.post("/register", upload.single("file"), register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", isLoggedIn, getProfile);

export default router;
