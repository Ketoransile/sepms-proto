import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import submissionRoutes from "./routes/submissions";
import uploadRoutes from "./routes/upload";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ---------------------
// Middleware
// ---------------------
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);
            if (allowedOrigins.some((allowed) => origin.startsWith(allowed))) {
                return callback(null, true);
            }
            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------
// Connect to MongoDB
// ---------------------
connectDB();

// ---------------------
// Routes
// ---------------------
app.get("/api/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        service: "SEPMS Backend API",
        timestamp: new Date().toISOString(),
    });
});

// Mount route modules
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/upload", uploadRoutes);
// app.use("/api/users", userRoutes);     // Phase 6
// app.use("/api/matches", matchRoutes);  // Phase 5

// ---------------------
// Error Handling Middleware
// ---------------------
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
});

// ---------------------
// Start Server (local dev only — Vercel uses the default export)
// ---------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 SEPMS Backend API running on http://localhost:${PORT}`);
});

// Default export for Vercel
export default app;
