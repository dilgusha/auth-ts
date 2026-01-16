import { Request, Response } from "express";
import { TodoService } from "../services/todoService";
import { AuthRequest } from "../middleware/auth";

const todoService = new TodoService();


export async function updateTodoStatus(req: AuthRequest, res: Response) {
  try {
    const todoId = Number(req.params.id);
    const userId = Number(req.user?.id);

    console.log("Controller:", { todoId, userId });

    if (!todoId) return res.status(400).json({ message: "Todo id is required" });

    const todo = await todoService.updateStatus(todoId, userId);

    res.json({
      message: "Todo status toggled successfully",
      todo
    });
  } catch (err: any) {
    console.error("Error:", err.message);
    res.status(400).json({ message: err.message });
  }
}


export async function createTodo(req: any, res: Response) {
  try {
    const { title } = req.body;
    const todo = await todoService.create(req.user.id, title);
    res.status(201).json(todo);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getTodos(req: AuthRequest, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const userId = req.params.userId || req.user!.id;

    const todos = await todoService.getAll(userId, page, limit);
    res.json(todos);

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getTodo(req: any, res: Response) {
  try {

    const todo = await todoService.getOne(req.params.id, req.params.id);
    res.json(todo);
  } catch (err: any) {
    res.status(404).json({ message: err.message });
  }
}

export async function updateTodo(req: any, res: Response) {
  try {
    const { title, completed } = req.body;
    const todo = await todoService.update(req.user.id, req.params.id, title, completed);
    res.json(todo);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
// export async function updateMyTodo(req: any, res: Response) {
//   try {
//     const { title, completed } = req.body;
//     const todo = await todoService.update(req.user.id, req.params.id, title, completed);
//     res.json(todo);
//   } catch (err: any) {
//     res.status(400).json({ message: err.message });
//   }
// }

export async function deleteTodo(req: any, res: Response) {
  try {
    const result = await todoService.remove(req.user.id, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}



export async function searchTodos(req: AuthRequest, res: Response) {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({ message: "Search query is required" });
    }
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const todos = await todoService.search(
      req.user.id,
      search as string
    );

    res.json(todos);
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
}

