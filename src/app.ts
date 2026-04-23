import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// ============================================================
// Load Environment Variables FIRST
// ============================================================
// dotenv reads your .env file and puts all variables into
// process.env (Node's equivalent of C# appsettings.json)
//
// MUST be called before anything else that uses process.env
// ============================================================
dotenv.config();

// ============================================================
// Connect to Database
// ============================================================
connectDB();

// ============================================================
// Create Express App
// ============================================================
// Express is the web framework. Think of it like:
// ASP.NET Core's WebApplication.CreateBuilder() equivalent.
// ============================================================
const app = express();

// ============================================================
// Global Middleware (runs on EVERY request)
// ============================================================

// CORS: Allows your React frontend (on a different port/domain)
// to make requests to this API.
// C# equivalent: builder.Services.AddCors(...)
app.use(cors());

// express.json(): Parses incoming JSON request bodies.
// Without this, req.body would be undefined.
// C# equivalent: This is automatic with [ApiController]
app.use(express.json());

// ============================================================
// Routes
// ============================================================
// Mount our auth router at "/api/auth"
// So "/register" in authRoutes becomes "/api/auth/register"
//
// C# equivalent: app.MapControllers() with route attributes
// ============================================================
app.use("/api/auth", authRoutes);

// ============================================================
// Health Check Route
// ============================================================
// Simple route to verify the server is running.
// Hit GET http://localhost:5000/health to test.
// ============================================================
app.get("/health", (req, res) => {
  res.json({ success: true, message: "RootUP API is running 🚀" });
});

// ============================================================
// Start the Server
// ============================================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;