import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load env vars
dotenv.config();

import productsRouter from "./routes/products.js";
import defectsRouter from "./routes/defects.js";
import productionRouter from "./routes/production.js";
import machinesRouter from "./routes/machines.js";
import employeesRouter from "./routes/employees.js";
import pdiRouter from "./routes/pdi.js";
import teamsRouter from "./routes/teams.js";
import moldsRouter from "./routes/molds.js";
import momRouter from "./routes/mom.js";
import tasksRouter from "./routes/tasks.js";
import authRoutes from "./routes/auth.js";
import permissionsRouter from "./routes/permissions.js";
import preventivemaintenanceRouter from './routes/preventive-maintenance.js'

const app = express();
const port = process.env.PORT || 5000;

// CORS
app.use(cors({
  origin: "*", // frontend
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], // include Authorization
}));

app.use(express.json());

// ✅ Public routes (no auth)
app.use("/api", authRoutes);

// ✅ Protected routes
app.use("/api", machinesRouter);
app.use("/api", employeesRouter);
app.use("/api", pdiRouter);
app.use("/api", teamsRouter);
app.use("/api", moldsRouter);
app.use("/api", momRouter);
app.use("/api", tasksRouter);
app.use("/api", productsRouter);
app.use("/api", defectsRouter);
app.use("/api", productionRouter);
app.use("/api", permissionsRouter);
app.use("/api", preventivemaintenanceRouter);

// Serve frontend build
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "../dist");
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const HOST = "0.0.0.0";
app.listen(port, HOST, () => {
  console.log(`Server running on http://localhost:${port}`);
});

