import type { Response } from "express";
import OnboardingProfile from "../models/OnboardingProfile.js";
import User from "../models/User.js";
import type { AuthRequest } from "../middleware/authMiddleware.js";

// ============================================================
// Why do we use AuthRequest instead of Request here?
// ============================================================
// Remember in authMiddleware.ts we defined AuthRequest which
// extends Express's Request and adds a "user" field:
//   req.user = { id: "...", role: "..." }
//
// The protect() middleware sets this before our controller runs.
// By using AuthRequest here, TypeScript knows req.user exists
// and won't throw a type error when we access req.user.id.
//
// If we used plain Request, TypeScript would say:
//   "Property 'user' does not exist on type 'Request'"
// ============================================================

// ============================================================
// @route   POST /api/onboarding
// @desc    Save the 5-step onboarding wizard data
// @access  Private (requires JWT token)
// ============================================================
export const submitOnboarding = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // 1. Get the logged-in user's ID from the JWT (set by protect middleware)
    const userId = req.user!.id;
    // The "!" after req.user is TypeScript's "non-null assertion"
    // We're telling TS: "trust me, req.user exists here"
    // It exists because protect() middleware already verified the token

    // 2. Destructure all 5 steps from the request body
    const {
      dreamRoles,        // Step 1: array of strings
      inspiringCompanies,// Step 2: array of strings
      industries,        // Step 3: array of strings
      careerStage,       // Step 4: single string
      monthlyBudget,     // Step 5: single string
      weeklyStudyHours,  // Step 5: number
      careerGoal,        // Step 5: optional string
    } = req.body;

    // 3. Check if this user already completed onboarding
    //    We don't want duplicate onboarding documents
    const existing = await OnboardingProfile.findOne({ userId });
    if (existing) {
      res.status(400).json({
        success: false,
        message: "Onboarding already completed. Use PUT to update.",
      });
      return;
    }

    // 4. Create the OnboardingProfile document in MongoDB
    //    Mongoose will run our schema validations before saving
    const profile = await OnboardingProfile.create({
      userId,
      dreamRoles,
      inspiringCompanies,
      industries,
      careerStage,
      monthlyBudget,
      weeklyStudyHours,
      careerGoal,
      completedAt: new Date(),
    });

    // 5. Mark onboardingCompleted = true on the User document
    // --------------------------------------------------------
    // This is important — the User model has an
    // "onboardingCompleted" boolean field.
    // The frontend uses this to know whether to show
    // the onboarding wizard or skip straight to dashboard.
    //
    // findByIdAndUpdate(id, update, options):
    //   - id: which document to update
    //   - { $set: { field: value } } — MongoDB update operator
    //     $set only updates the specified fields, leaves rest alone
    //     C# EF equivalent: user.OnboardingCompleted = true;
    //                        await _context.SaveChangesAsync();
    //   - { new: true } — return the UPDATED document (not the old one)
    // --------------------------------------------------------
    await User.findByIdAndUpdate(
      userId,
      { $set: { onboardingCompleted: true } },
      { new: true }
    );

    // 6. Send success response
    res.status(201).json({
      success: true,
      message: "Onboarding completed successfully.",
      data: { profile },
    });
  } catch (error: any) {
    // Catch Mongoose validation errors (enum, required, array length)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({
        success: false,
        message: messages.join(". "),
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Server error during onboarding.",
    });
  }
};

// ============================================================
// @route   GET /api/onboarding
// @desc    Get the logged-in user's onboarding profile
// @access  Private
// ============================================================
export const getOnboarding = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // findOne({ userId }) finds the document where userId matches
    // C# equivalent: _context.OnboardingProfiles
    //                  .FirstOrDefaultAsync(o => o.UserId == userId)
    const profile = await OnboardingProfile.findOne({ userId });

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Onboarding profile not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ============================================================
// @route   PUT /api/onboarding
// @desc    Update the onboarding profile (if user wants to edit)
// @access  Private
// ============================================================
export const updateOnboarding = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    // findOneAndUpdate(filter, update, options)
    // --------------------------------------------------------
    // $set — only updates the fields you send.
    //        If you only send dreamRoles, only dreamRoles updates.
    //        Other fields stay the same.
    //
    // { new: true }    — return updated document
    // { runValidators: true } — run schema validations on update too
    //   (by default Mongoose skips validators on updates!)
    // --------------------------------------------------------
    const profile = await OnboardingProfile.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!profile) {
      res.status(404).json({
        success: false,
        message: "Onboarding profile not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Onboarding profile updated.",
      data: { profile },
    });
  } catch (error: any) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(
        (err: any) => err.message
      );
      res.status(400).json({ success: false, message: messages.join(". ") });
      return;
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};