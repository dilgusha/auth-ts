import { Router } from "express";
import {
    createTodo,
    getTodos,
    getTodo,
    updateTodo,
    deleteTodo
} from "../controllers/todoController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.post("/", authMiddleware, createTodo);
router.get("/", getTodos);
router.get("/:id", authMiddleware, getTodo);
router.put("/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);

export default router;
