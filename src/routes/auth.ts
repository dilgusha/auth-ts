import { Router } from "express";
import { register, login, refreshToken, logout, createUser } from "../controllers/authController";
import { create } from "domain";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { Role } from "../utils/jwt";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post('/logout', logout)
router.post('/create-user', authMiddleware,roleMiddleware([Role.ADMIN]),createUser)


export default router;
