import type { Request, Response } from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

// ============================================================
// What is a Controller?
// ============================================================
// Controllers handle the actual business logic for each route.
// They receive a request, do something (talk to DB, etc.),
// and send back a response.
//
// In Express, controllers are just functions - not classes.
// Each function handles one specific action (register, login, etc.)
// ============================================================

// ============================================================
// Helper: Standard Response Format
// ============================================================
// We always send back a consistent JSON structure:
// {
//   success: true/false,
//   message: "...",
//   data: { ... }   (only on success)
// }
// This makes it easy for the frontend to handle responses.
// ============================================================

// ============================================================
// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (no token needed)
// ============================================================
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Destructure the request body
    //    C# equivalent: [FromBody] RegisterDto model
    const { fullName, email, passwordHash, role } = req.body;

    // 2. Basic validation - check required fields exist
    if (!fullName || !email || !passwordHash) {
      res.status(400).json({
        success: false,
        message: "Please provide full name, email, and password.",
      });
      return;
    }

    // 3. Check if a user with this email already exists
    //    User.findOne() returns null if not found
    //    C# equivalent: await _context.Users.FirstOrDefaultAsync(u => u.Email == email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    // 4. Create the new user
    //    Note: we don't hash the password here - our UserSchema
    //    "pre save" hook does that automatically before saving to DB!
    //    C# equivalent: _context.Users.Add(newUser); await _context.SaveChangesAsync();
    const user = await User.create({
      fullName,
      email,
      passwordHash,
      role: role || "jobseeker", // Default to jobseeker if not specified
    });

    // 5. Generate a JWT for the new user so they're immediately logged in
    const token = generateToken(user);

    // 6. Send back the response
    //    HTTP 201 = "Created" (use this for successful POST that creates a resource)
    //    We deliberately exclude the password from the response
    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    // Mongoose validation errors (from our Schema rules) come back
    // with error.name === "ValidationError"
    if (error.name === "ValidationError") {
      // Extract all validation messages into an array
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
      return;
    }

    // Mongoose duplicate key error (email already exists at DB level)
    if (error.code === 11000) {
      res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    // Generic server error
    res.status(500).json({
      success: false,
      message: "Server error during registration.",
    });
  }
};

// ============================================================
// @route   POST /api/auth/login
// @desc    Login an existing user
// @access  Public (no token needed)
// ============================================================
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
      return;
    }

    // 2. Find the user by email
    //    Remember: password has "select: false" in our schema,
    //    so we must explicitly request it with .select("+passwordHash")
    const user = await User.findOne({ email }).select("+passwordHash");

    // 3. Check user exists AND password is correct
    //    We combine these into one check so we don't reveal
    //    whether the email exists (security best practice)
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    // 4. Generate token and send response
    const token = generateToken(user);

    // HTTP 200 = "OK" (standard success)
    res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

// ============================================================
// @route   GET /api/auth/me
// @desc    Get currently logged-in user's info
// @access  Private (token required - uses protect middleware)
// ============================================================
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    // req.user.id was set by our authMiddleware "protect" function
    // We fetch fresh data from DB (in case profile was updated)
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};