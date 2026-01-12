import { Request, Response, NextFunction } from "express";
import { query } from "../config/connection";
import { AuthRequest } from "./auth";

export const profileGuard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId =
      req.params.userId ??
      req.query.userId ??
      req.user?.id;
    if (!userId) return res.status(404).json({ message: "User not found" });

    const myUser = req.user;
    if (!myUser) return res.status(401).json({ message: "Unauthorized" });

    if (myUser.id === userId) return next();

    const userResult = await query(
      `SELECT id, is_private 
       FROM users 
       WHERE id = $1`,

      [userId]
    );

    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.is_private) return res.status(403).json({ message: "Profile is private" });

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
