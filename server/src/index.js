import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

import authRoutes from "./routes/auth.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import tableRoutes from "./routes/table.routes.js";
import orderRoutes from "./routes/order.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import reportRoutes from "./routes/report.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const server = http.createServer(app);

// Inisialisasi Socket.IO untuk pembaruan pesanan real-time
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Logging sederhana untuk request
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log("🔌 Klien terhubung ke WebSocket:", socket.id);

  socket.on("join_table", (tableNumber) => {
    socket.join(`table_${tableNumber}`);
    console.log(`Pelanggan bergabung ke channel meja: table_${tableNumber}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Klien terputus:", socket.id);
  });
});

// Routes Registrations
app.use("/api/auth", authRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reports", reportRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Saung Pete Cina Backend API",
    database: process.env.DB_NAME || "db_saoengpetecina",
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint API tidak ditemukan." });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Terjadi kesalahan internal pada server.", error: err.message });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Server Backend Saung Pete Cina berjalan di port ${PORT}`);
  console.log(`📡 URL API: http://localhost:${PORT}/api`);
  console.log(`🗄️ Database: ${process.env.DB_NAME || "db_saoengpetecina"}`);
  console.log(`====================================================`);
});
