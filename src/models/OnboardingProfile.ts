import mongoose, { Document, Schema } from "mongoose";

// ============================================================
// What is this file?
// ============================================================
// This is the model for the 5-step onboarding wizard.
// After a user registers, they go through 5 steps:
//   Step 1 — dreamRoles       (what roles do you want?)
//   Step 2 — inspiringCompanies (which companies inspire you?)
//   Step 3 — industries       (what industries interest you?)
//   Step 4 — careerStage      (where are you in your journey?)
//   Step 5 — budget, hours, careerGoal
//
// We store ALL 5 steps as ONE document in MongoDB.
// One user = one OnboardingProfile document.
// ============================================================

// ============================================================
// The TypeScript Interface
// ============================================================
// Just like our IUser interface, this defines the "shape"
// of an OnboardingProfile document in TypeScript.
// ============================================================
export interface IOnboardingProfile extends Document {
  userId: mongoose.Types.ObjectId; // Link back to the User
  dreamRoles: string[];
  inspiringCompanies: string[];
  industries: string[];
  careerStage: "studying" | "fresh_grad" | "entry" | "mid" | "senior";
  monthlyBudget: "free" | "under_20" | "up_to_50" | "no_limit";
  weeklyStudyHours: number;
  careerGoal?: string; // Optional — the "?" means it's not required
  completedAt: Date;
}

// ============================================================
// The Mongoose Schema
// ============================================================
const OnboardingProfileSchema = new Schema<IOnboardingProfile>(
  {
    // --------------------------------------------------------
    // userId — Foreign Key (like a FK in SQL / EF navigation)
    // --------------------------------------------------------
    // mongoose.Schema.Types.ObjectId is MongoDB's ID type.
    // "ref: 'User'" tells Mongoose this references the User
    // collection. Later we can use .populate('userId') to
    // automatically fetch the full User object — like a JOIN.
    //
    // C# EF equivalent:
    //   public Guid UserId { get; set; }
    //   [ForeignKey("UserId")]
    //   public User User { get; set; }
    // --------------------------------------------------------
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One onboarding profile per user — enforced at DB level
    },

    // --------------------------------------------------------
    // Arrays of strings — Step 1, 2, 3
    // --------------------------------------------------------
    // In MongoDB, arrays are native. No join table needed
    // unlike SQL where you'd need a separate table.
    //
    // [String] is shorthand for { type: [String] }
    // validate: checks the array has at least 1 item
    // --------------------------------------------------------
    dreamRoles: {
      type: [String],
      required: [true, "Please select at least one dream role"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Please select at least one dream role",
      },
    },

    inspiringCompanies: {
      type: [String],
      required: [true, "Please select at least one company"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Please select at least one company",
      },
    },

    industries: {
      type: [String],
      required: [true, "Please select at least one industry"],
      validate: {
        validator: (arr: string[]) => arr.length > 0,
        message: "Please select at least one industry",
      },
    },

    // --------------------------------------------------------
    // careerStage — Step 4 (single select)
    // --------------------------------------------------------
    // enum restricts the value to only these 5 options.
    // If someone sends "expert" it will fail validation.
    // --------------------------------------------------------
    careerStage: {
      type: String,
      enum: {
        values: ["studying", "fresh_grad", "entry", "mid", "senior"],
        message: "Invalid career stage: {VALUE}",
        // {VALUE} is a Mongoose placeholder — it inserts
        // the actual bad value into the error message
      },
      required: [true, "Please select your career stage"],
    },

    // --------------------------------------------------------
    // Step 5 fields
    // --------------------------------------------------------
    monthlyBudget: {
      type: String,
      enum: {
        values: ["free", "under_20", "up_to_50", "no_limit"],
        message: "Invalid budget option: {VALUE}",
      },
      required: [true, "Please select your monthly budget"],
    },

    weeklyStudyHours: {
      type: Number,
      required: [true, "Please select your weekly study hours"],
      // enum works on Numbers too — only these exact values allowed
      enum: {
        values: [5, 10, 15, 20, 30],
        message: "Weekly hours must be 5, 10, 15, 20, or 30",
      },
    },

    // --------------------------------------------------------
    // careerGoal — Optional free text field
    // --------------------------------------------------------
    // No "required" means it's optional.
    // trim removes extra whitespace.
    // maxlength prevents someone sending a 10,000 word essay.
    // --------------------------------------------------------
    careerGoal: {
      type: String,
      trim: true,
      maxlength: [500, "Career goal cannot exceed 500 characters"],
    },

    // --------------------------------------------------------
    // completedAt — when the wizard was finished
    // --------------------------------------------------------
    completedAt: {
      type: Date,
      default: Date.now, // Automatically set to current time
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    collection: "onboardingProfiles", // MongoDB collection name
  }
);

const OnboardingProfile = mongoose.model<IOnboardingProfile>(
  "OnboardingProfile",
  OnboardingProfileSchema
);

export default OnboardingProfile;