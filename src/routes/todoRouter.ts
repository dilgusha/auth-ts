import { Router } from "express";
import {
    createTodo,
    getTodos,
    getTodo,
    updateTodo,
    deleteTodo,
    updateTodoStatus,
    searchTodos
} from "../controllers/todoController";
import { authMiddleware } from "../middleware/auth";
import { roleMiddleware } from "../middleware/roleMiddleware";
import { Role } from "../utils/jwt";
import { rateLimiter } from "../middleware/rateLimiting";
import { profileGuard } from "../middleware/profileMiddleware";

const router = Router();

router.get("/all-todos/:userId?", authMiddleware, profileGuard, getTodos);
router.post("/", authMiddleware, rateLimiter({ seconds: 60, maxRequests: 3 }), createTodo);
router.get("/:id/todo", authMiddleware, getTodo);
router.put("/myTodo/:id", authMiddleware, updateTodo);
router.delete("/:id", authMiddleware, deleteTodo);

router.patch(
    "/:id/status",
    authMiddleware,
    updateTodoStatus
);


router.get("/search", authMiddleware, searchTodos);



export default router;
