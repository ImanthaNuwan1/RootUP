import mongoose from "mongoose";
import 'dotenv/config'; 

// ============================================================
// Database Connection
// ============================================================
// Mongoose is the "ORM" for MongoDB in Node.js.
// it lets you work with MongoDB using JavaScript/TypeScript objects
// instead of raw MongoDB queries.
// ============================================================

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in environment variables.");
    }

    const conn = await mongoose.connect(mongoURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit the process with failure code
    // In production you'd want more graceful handling
    process.exit(1);
  }
};

export default connectDB;