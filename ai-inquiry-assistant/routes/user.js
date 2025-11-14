import {
  getUsers,
  logIn,
  logOut,
  signUp,
  updateUser,
} from "../controllers/user.js";
import express from "express";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/update-user", authenticate, updateUser);
router.post("/users", authenticate, getUsers);
router.post("/signup", signUp);
router.post("/login", logIn);
router.post("/logout", logOut);

export default router;
