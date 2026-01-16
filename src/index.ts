import cookieParser from "cookie-parser";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

import express from "express";
import "./config/connection";
import cors from "cors";

import authRoutes from "./routes/auth";
import todoRoutes from "./routes/todoRouter";
import { authMiddleware } from "./middleware/auth";
import helmet from "helmet";

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:3000"

];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);


app.use(helmet())
app.use("/api/auth", authRoutes);
app.use("/api/todo", todoRoutes);

app.use(cookieParser());



app.get("/", (req, res) => {
  res.send("Hello World!");
});


app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({ message: "You accessed protected route", user: (req as any).user });
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
