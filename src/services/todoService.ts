import { query } from "../config/connection";

export class TodoService {
  async create(userId: string, title: string) {
    const result = await query(
      "INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *",
      [userId, title]
    );
    return result.rows[0];
  }

  async getAll(userId: string) {
    const result = await query(
      "SELECT * FROM todos WHERE user_id = $1 ORDER BY id DESC",
      [userId]
    );
    return result.rows;
  }

  async getOne(userId: string, todoId: string) {
    const result = await query(
      "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Todo not found");
    }

    return result.rows[0];
  }

  async update(userId: string, todoId: string, title: string, completed: boolean) {
    const result = await query(
      `UPDATE todos 
       SET title = $1, completed = $2
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [title, completed, todoId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Todo not found or not owned by user");
    }

    return result.rows[0];
  }

  async remove(userId: string, todoId: string) {
    const result = await query(
      "DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *",
      [todoId, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("Todo not found");
    }

    return { message: "Todo deleted successfully" };
  }
}
