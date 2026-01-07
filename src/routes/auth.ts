import { Router } from "express";
import { register, login, refreshToken, logout, createUser, verifyEmail, resetPass, forgotPass, getProfile, changePass } from "../controllers/authController";
import { create } from "domain";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { Role } from "../utils/jwt";
import { authMiddleware } from "../middleware/auth";

const router = Router();
router.get("/profile", authMiddleware, getProfile);
router.post("/change-password", authMiddleware, changePass);
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post('/logout', logout)
router.post('/create-user', authMiddleware, roleMiddleware([Role.ADMIN]), createUser)

// router.post("/send-verify-code", sendVerifyCode)
router.post("/verify-email", verifyEmail)

router.post("/forgot-password", forgotPass)
router.post("/reset-password", resetPass)

export default router;
