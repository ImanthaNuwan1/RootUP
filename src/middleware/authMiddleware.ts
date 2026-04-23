import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ============================================================
// What is Middleware?
// ============================================================
// In Express, every request goes through a "pipeline" of functions
// before reaching your controller. These functions are middleware.
//
// Think of it like ASP.NET Middleware in C#:
//   app.UseAuthentication();
//   app.UseAuthorization();
//
// Each middleware function receives:
//   req  = the incoming request
//   res  = the response we'll send back
//   next = a function to call when this middleware is done
//          (passes control to the next middleware or controller)
//
// Pipeline: Request → authMiddleware → roleMiddleware → Controller → Response
// ============================================================

// ============================================================
// Extending the Express Request Type
// ============================================================
// By default, Express's "req" object doesn't have a "user" field.
// We extend it here so TypeScript knows about it.
//
// ============================================================
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// ============================================================
// The Auth Middleware Function
// ============================================================
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1. Check if token exists in the Authorization header
    //    The header looks like: "Bearer eyJhbGciOiJIUzI1NiIs..."
    //    We split on " " and grab the second part (the actual token)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2. If no token found, block the request
    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
      return;
    }

    // 3. Verify the token's signature using our JWT_SECRET
    //    If the token was tampered with, this will throw an error
    //    jwt.verify returns the decoded payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };

    // 4. Check the user still exists in the database
    //    (handles case where account was deleted after token was issued)
    const userExists = await User.findById(decoded.id);
    if (!userExists) {
      res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
      return;
    }

    // 5. Attach the user info to the request object
    //    Now any route after this middleware can access req.user
    req.user = { id: decoded.id, role: decoded.role };

    // 6. Pass control to the next middleware or controller
    next();
  } catch (error) {
    // jwt.verify throws if token is expired or invalid
    res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// ============================================================
// Role-Based Authorization Middleware
// ============================================================
// This middleware factory lets us restrict routes by role.
//
// Usage in routes:
//   router.get("/employer-only", protect, restrictTo("employer"), controller)
// ============================================================
export const restrictTo = (...roles: string[]) => {
  // We return a NEW middleware function
  // This is a "closure" - the inner function remembers "roles"
  // from the outer function even after the outer function has returned
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(", ")} can access this route.`,
      });
      return;
    }
    next();
  };
};


//Example of restrictTo
//Only employers can post jobs
//     |--- router.post("/jobs", authMiddleware, restrictTo("employer"), createJob);