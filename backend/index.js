import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables first
dotenv.config();

// Routers
import productsRouter from './routes/products.js';
import defectsRouter from './routes/defects.js';
import productionCodesRouter from './routes/production-codes.js';
import productionRouter from './routes/production.js';
import machinesRouter from './routes/machines.js';
import employeesRouter from './routes/employees.js';
import pdiRouter from './routes/pdi.js';
import teamsRouter from './routes/teams.js';
import moldsRouter from './routes/molds.js';
import momRouter from './routes/mom.js';
import tasksRouter from './routes/tasks.js';

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// app.use(cors());

app.use(cors({
  origin: "*", // or restrict to your frontend domain
  methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
  // credentials: true
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Mount routers
app.use(machinesRouter);
app.use(employeesRouter);
app.use(pdiRouter);
app.use(teamsRouter);
app.use(moldsRouter);
app.use(momRouter);
app.use(tasksRouter);
app.use(productsRouter);
app.use(defectsRouter);
app.use(productionCodesRouter);
app.use(productionRouter);

// ? Serve React build (dist folder)
// Correct way (portable)

// Equivalent of __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("dirname:", __dirname);
console.log("filename:", __filename);

const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const HOST = "0.0.0.0"; // listen on all interfaces

// Start server
app.listen(port, HOST, () => {
  console.log(`?? Server running on http://localhost:${HOST}:${port}`);
});
