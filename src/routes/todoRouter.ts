import { Router } from "express";
import {
    createTodo,
    getTodos,
    getTodo,
    updateTodo,
    deleteTodo
} from "../controllers/todoController";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { Role } from "../utils/jwt";
import { rateLimiter } from "../middleware/rateLimiting";

const router = Router();

router.get("/all-todos", authMiddleware,getTodos);
router.post("/", authMiddleware, rateLimiter({ seconds: 60, maxRequests: 3 }), createTodo);
router.get("/:id/todo", authMiddleware, getTodo);
router.put("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);

export default router;
