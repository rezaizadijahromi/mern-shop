import express from "express";
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  verifyUser,
  getUsers,
  deleteUser,
  getUsersById,
} from "../controllers/userControllers.js";
import { admin, protect } from "../middlewares/authMiddleWare.js";

const router = express.Router();

router.route("/").post(registerUser).get(protect, admin, getUsers);
router.route("/confirm/:confirmationCode").get(verifyUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);
router.post("/login", authUser);

router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUsersById)
  .put(protect, admin, updateUserProfile);

export default router;
