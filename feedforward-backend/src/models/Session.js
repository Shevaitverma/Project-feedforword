import mongoose from "mongoose";

// Define the Session Schema
const SessionSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      token: {
        type: String,
        required: true,
        unique: true, // Ensures each session token is unique
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: '7d', // Automatically delete session after 7 days (adjust as needed)
      },
      expiresAt: {
        type: Date,
        required: true,
      },
    },
    {
      timestamps: false,
    }
  );
  
// Optional: Add a TTL index to automatically remove expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  
const Session = mongoose.model('Session', SessionSchema);
export default Session;