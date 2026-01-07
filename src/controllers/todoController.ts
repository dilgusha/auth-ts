import { Request, Response } from "express";
import { TodoService } from "../services/todoService";
import { AuthRequest } from "../middleware/auth";

const todoService = new TodoService();

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

    const todos = await todoService.getAll(req.user!.id, page, limit);
    res.json(todos);

  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}

export async function getTodo(req: any, res: Response) {
  try {
    const todo = await todoService.getOne(req.user.id, req.params.id);
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

export async function deleteTodo(req: any, res: Response) {
  try {
    const result = await todoService.remove(req.user.id, req.params.id);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
}
