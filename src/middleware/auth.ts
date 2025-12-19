import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { Role } from "../utils/jwt";
import { query } from "../config/connection";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string,
    role: Role
    
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyToken(token);
    if (payload.type !== "access") throw new Error("Invalid token");
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};


// export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader) return res.status(401).json({ message: "No token provided" });

//   const token = authHeader.split(" ")[1];

//   try {
//     const payload: any = verifyToken(token);
//     if (payload.type !== "access") throw new Error("Invalid token");

//     const userResult = await query(
//       `SELECT id, email, organization_id, is_active 
//        FROM users 
//        WHERE id = $1`,
//       [payload.id]
//     );

//     const user = userResult.rows[0];
//     if (!user || !user.is_active) return res.status(401).json({ message: "User inactive" });

//     const rolesResult = await query(
//       `SELECT r.name
//        FROM user_roles ur
//        JOIN roles r ON ur.role_id = r.id
//        WHERE ur.user_id = $1 AND ur.organization_id = $2`,
//       [user.id, user.organization_id]
//     );

//     req.user = {
//       id: user.id,
//       email: user.email,
//       organizationId: user.organization_id,
//       roles: rolesResult.rows.map((r: any) => r.name),
//     };

//     next();
//   } catch (err) {
//     console.error(err);
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };


// export const rbacMiddleware = (permission: string) => {
//   return async (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user || !req.user.organizationId) return res.status(403).json({ message: "No organization" });

//     const result = await query(
//       `SELECT 1
//        FROM user_roles ur
//        JOIN role_permissions rp ON ur.role_id = rp.role_id
//        JOIN permissions p ON rp.permission_id = p.id
//        WHERE ur.user_id = $1
//          AND ur.organization_id = $2
//          AND p.name = $3
//        LIMIT 1`,
//       [req.user.id, req.user.organizationId, permission]
//     );

//     if (result.rowCount === 0) {
//       return res.status(403).json({ message: "Permission denied" });
//     }

//     next();
//   };
// };