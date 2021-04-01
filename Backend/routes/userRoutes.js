import express from "express";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  verifyUser,
} from "../controllers/userControllers.js";
import { admin, protect } from "../middlewares/authMiddleWare.js";

const router = express.Router();

router.route("/").post(registerUser);
router.route("/confirm/:confirmationCode").get(verifyUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post("/login", authUser);

export default router;
