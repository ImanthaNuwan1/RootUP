import { Router } from "express";
import {
  submitOnboarding,
  getOnboarding,
  updateOnboarding,
} from "../controllers/onboardingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// ============================================================
// All onboarding routes are PRIVATE — you must be logged in.
// protect middleware runs before every controller here.
//
// POST   /api/onboarding  — submit the wizard (first time)
// GET    /api/onboarding  — fetch your onboarding data
// PUT    /api/onboarding  — update your onboarding data
//
// Notice we apply "protect" to every route individually.
// Alternative: router.use(protect) at the top would apply
// protect to ALL routes in this file automatically — cleaner
// when every route in the file needs auth (which is our case).
// ============================================================
router.use(protect); // Applies protect() to ALL routes below this line

router.post("/", submitOnboarding);
router.get("/", getOnboarding);
router.put("/", updateOnboarding);

export default router;