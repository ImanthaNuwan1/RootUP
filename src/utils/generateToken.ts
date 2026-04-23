import jwt from "jsonwebtoken";
import type { IUser } from "../models/User.js";
 
// ============================================================
// What is a JWT? (JSON Web Token)
// ============================================================
// When a user logs in, instead of storing their session on the
// server, we give them a signed "token" - like a tamper-proof
// wristband at a concert.
//
// The token has 3 parts (separated by dots):
//   Header.Payload.Signature
//
// Payload contains: userId, role, expiry time
// Signature: cryptographically signed with our JWT_SECRET
//            so we can verify it wasn't tampered with
//
// On every request, the client sends:
//   Authorization: Bearer <token>
// We verify the signature and trust the payload inside.
// ============================================================
 
export const generateToken = (user: IUser): string => {

    // If your JWT_SECRET is missing from your .env, this function will crash with a clear error message instead of generating an invalid token.
    if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is missing!");

  // jwt.sign(payload, secret, options)
  //   payload = data we want to embed in the token
  //   secret  = our private key from .env (never expose this!)
  //   expiresIn = token validity period
  return jwt.sign(
    {
      id: user._id,    // MongoDB document ID
      role: user.role, // "jobseeker" or "employer"
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d" as any, // Token valid for 7 days
    }
  );
};