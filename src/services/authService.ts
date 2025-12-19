import { RegisterDto, LoginDto, CreateUserDto } from "../types/auth";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateAccessToken, generateRefreshToken, Role, saveRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { query } from "../config/connection";

export class AuthService {
  async register(data: RegisterDto) {
    const existing = await query("SELECT * FROM users WHERE email = $1", [data.email]);
    if (existing.rows.length > 0) throw new Error("Email already registered");

    const hashed = await hashPassword(data.password);
    const result = await query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
      [data.name, data.email, hashed]
    );

    const created = result.rows[0];
    const accessToken = generateAccessToken({ id: String(created.id), email: created.email, role: Role.USER });
    const refreshToken = generateRefreshToken();

    await saveRefreshToken(String(created.id), refreshToken);

    const { password, ...userNoPass } = created;
    return { user: userNoPass, accessToken, refreshToken };
  }

  async login(data: LoginDto) {
    const result = await query("SELECT * FROM users WHERE email = $1", [data.email]);
    const user = result.rows[0];
    if (!user || !user.password) throw new Error("Invalid credentials");

    const ok = await comparePassword(data.password, user.password);
    if (!ok) throw new Error("Invalid credentials");

    const accessToken = generateAccessToken({ id: String(user.id), email: user.email, role: Role.USER });
    const refreshToken = generateRefreshToken();

    await saveRefreshToken(String(user.id), refreshToken);

    const { password, ...userNoPass } = user;
    return { user: userNoPass, accessToken, refreshToken };
  }

  async refreshToken(token: string) {

    if (!token) {
      throw new Error("No token provided");
    }
    const result = await verifyRefreshToken(token);

    if (!result) {
      throw new Error("Invalid or expired refresh token");
    }

    const accessToken = generateAccessToken({
      id: String(result.user_id),
      email: result.email,
      role: Role.USER
    });

    return { accessToken };
  }

  async logout(refreshToken: string, hardDelete: boolean = false) {
    if (!refreshToken && !hardDelete) throw new Error("No token provided");

    if (hardDelete) {
      const result = await query(
        "DELETE FROM refresh_tokens WHERE token = $1 RETURNING *",
        [refreshToken]
      );

      if (!result.rows[0]) throw new Error("Token not found");
      return { message: "Logout successful (hard delete)" };

    } else {

      const result = await query(
        "UPDATE refresh_tokens SET is_revoked = true WHERE token = $1 RETURNING *",
        [refreshToken]
      );

      if (!result.rows[0]) throw new Error("Token not found");
      return { message: "Logout successful (soft delete)" };
    }
  }


  async createUser(data: CreateUserDto) {
    const existing = await query("SELECT * FROM users WHERE email = $1", [data.email]);
    if (existing.rows.length > 0) throw new Error("Email already registered");

    const hashed = await hashPassword(data.password);
    const result = await query(
      "INSERT INTO users (name, email, password,role) VALUES ($1, $2, $3,$4) RETURNING *",
      [data.name, data.email, hashed, data.role]
    );

    const created = result.rows[0];
    const accessToken = generateAccessToken({ id: String(created.id), email: created.email, role: created.role });
    const refreshToken = generateRefreshToken();

    await saveRefreshToken(String(created.id), refreshToken);

    const { password, ...userNoPass } = created;
    return { user: userNoPass, accessToken, refreshToken };


  }

}
