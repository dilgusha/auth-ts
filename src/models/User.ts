import { query } from "../config/connection";
import { User } from "../types/user";

export class UserModel {
  async findByEmail(email: string): Promise<User | null> {
    const res = await query("SELECT id, email, password, name, created_at FROM users WHERE email = $1", [email]);
    if (!res.rows.length) return null;
    return res.rows[0];
  }

  async findById(id: number): Promise<User | null> { 
    const res = await query("SELECT id, email, name, created_at FROM users WHERE id = $1", [id]);
    if (!res.rows.length) return null;
    return res.rows[0];
  }

  async create(user: { email: string; password: string; name?: string; }): Promise<User> {
    const res = await query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3, $4) RETURNING id, email, name, created_at",
      [user.email, user.password, user.name || null]
    );
    return res.rows[0];
  }
}
