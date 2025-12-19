import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import { Role } from "../utils/jwt";

export const roleMiddleware = (roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
 
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You dont have permission to access this route" });
        }

        next();
    };
};
