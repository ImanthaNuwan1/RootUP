import { Router } from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

// ============================================================
// What is a Router?
// ============================================================
// Express Router is a mini-application that handles a group
// of related routes. We then "mount" it in app.ts.
//
// C# equivalent: An ApiController with a [Route] prefix
//   [Route("api/auth")]
//   public class AuthController : ControllerBase { ... }
//
// The Router here handles all "/api/auth/..." routes.
// ============================================================
const router = Router();

// ============================================================
// Route Definitions
// ============================================================
// Pattern: router.METHOD(path, ...middlewares, controller)
//
// Public routes (no token needed):
router.post("/register", register);  // POST /api/auth/register
router.post("/login", login);        // POST /api/auth/login

// Protected route (token required):
// "protect" middleware runs FIRST, verifies the token,
// then passes to "getMe" controller only if token is valid
router.get("/me", protect, getMe);   // GET /api/auth/me

export default router;