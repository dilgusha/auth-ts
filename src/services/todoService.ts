import { query } from "../config/connection";

export class TodoService {
  async create(userId: string, title: string) {
    const result = await query(
      "INSERT INTO todos (user_id, title) VALUES ($1, $2) RETURNING *",
      [userId, title]
    );
    return result.rows[0];
  }

  async updateStatus(todoId: number, userId: number) {
    const todoResult = await query(
      `SELECT id, user_id, is_completed FROM todos WHERE id = $1`,
      [todoId]
    );

    console.log("Service SELECT:", todoResult.rows);

    const todo = todoResult.rows[0];
    if (!todo) throw new Error("Todo not found");

    const result = await query(
      `UPDATE todos
     SET is_completed = NOT is_completed
     WHERE id = $1 AND user_id = $2
     RETURNING *`,
      [todoId, userId]
    );

    console.log("Service UPDATE:", result.rows);

    if (result.rowCount === 0)
      throw new Error("Todo not found or you are not allowed to update it");

    return result.rows[0];
  }



  // async getAll(userId: string) {
  //   const result = await query(
  //     "SELECT * FROM todos WHERE user_id = $1 ORDER BY id DESC",
  //     [userId]
  //   );
  //   return result.rows;
  // }


  async getAll(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const offset = (page - 1) * limit;

    const todosResult = await query(
      `SELECT *
    FROM todos
    WHERE user_id = $1
    ORDER BY id DESC
    LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    const countResult = await query(
      `SELECT COUNT(*) 
    FROM todos 
    WHERE user_id = $1`,
      [userId]
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      data: todosResult.rows,
      meta: {
        page,
        limit,
        total,
        totalPages,
      },
    };
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
     WHERE id = $3
     RETURNING *`,
      [title, completed, todoId]
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


  async search(userId: string, search: string) {
    const result = await query(
      ` SELECT *
    FROM todos
    WHERE user_id = $1
      AND title ILIKE $2
    ORDER BY id DESC
    `,
      [userId, `%${search}%`]
    );

    return result.rows;
  } 



}
