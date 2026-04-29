import userRoutes from "./routes/userRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import express from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Basic Route
app.get("/", (req: Request, res: Response) => {
  res.send("Håll Sverige Rent API is running! 🌍✨");
});

// Test route to check if .env is working
app.get("/config-test", (req: Request, res: Response) => {
  res.json({
    port: PORT,
    db_connected: !!process.env.DATABASE_URL,
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});
