import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  authProvider: "local" | "google";
  role: "seeker" | "employer";
  profilePicUrl: string;
  roleReadinessScore: number;
  currentSkills: string[];
  missingSkills: string[];
  softSkillScores: {
    communication: number;
    leadership: number;
    problemSolving: number;
  };
  subscriptionTier: "free" | "pro";
  points: number;
  streakDays: number;
  podId?: mongoose.Types.ObjectId;
  onboardingCompleted: boolean;
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: {
      type: String,
      enum: ["seeker", "employer"],
      default: "seeker",
    },
    profilePicUrl: {
      type: String,
      default: "",
    },
    roleReadinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    softSkillScores: {
      communication: { type: Number, default: 0, min: 0, max: 100 },
      leadership:    { type: Number, default: 0, min: 0, max: 100 },
      problemSolving:{ type: Number, default: 0, min: 0, max: 100 },
    },
    subscriptionTier: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
    points: {
      type: Number,
      default: 0,
    },
    streakDays: {
      type: Number,
      default: 0,
    },
    podId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pod", // References the Pod collection
      default: null,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Pre-save hook — hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next;

  const bcrypt = await import("bcryptjs");
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// Instance method — compare entered password to stored hash
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;