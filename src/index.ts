import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import express from "express";
import "./config/connection";

import authRoutes from "./routes/auth";
import todoRoutes from "./routes/todoRouter";
import { authMiddleware } from "./middleware/auth";

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/todo", todoRoutes);

app.use(cookieParser());


app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You accessed protected route", user: (req as any).user });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
