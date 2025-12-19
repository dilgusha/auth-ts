import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { query } from "../config/connection";

dotenv.config();

const jwtCode = process.env.JWT_SECRET as string;

export enum Role {
  USER = "user",
  ADMIN = "admin"
}

export interface JwtPayload {
  id: string;
  email: string;
  type?: 'access' | 'refresh';
  role: Role
}

export const generateAccessToken = (payload: JwtPayload): string => {
  return jwt.sign({ ...payload, type: "access" }, jwtCode, { expiresIn: "1d" });
};

export const generateRefreshToken = (): string => {
  return crypto.randomBytes(64).toString("hex");
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, jwtCode) as JwtPayload;
};

export const saveRefreshToken = async (userId: string, token: string) => {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
    [userId, token, expiresAt]
  );
};

export const cleanUpRefreshTokens = async () => {
  await query("DELETE FROM refresh_tokens WHERE expires_at < NOW()");
};

export const verifyRefreshToken = async (token: string) => {
  const result = await query(
    "SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()",
    [token]
  );
  return result.rows[0] || null;
};
