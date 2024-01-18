import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connect from "./db/connect.js";
import userRoutes from "./routes/userRoutes.js";
import authRoute from "./routes/authRoute.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoute);

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to Blog backend API" });
});

app.listen(PORT, () => {
  connect();
  console.log(`Server is started on port: ${PORT}`);
});