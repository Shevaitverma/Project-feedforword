import mongoose from 'mongoose';

// Define the Like Schema
const LikeSchema = new mongoose.Schema(
    {
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    },
    {
      timestamps: false,
    }
  );
  
  // Prevent duplicate likes by the same user on the same post
  LikeSchema.index({ postId: 1, userId: 1 }, { unique: true });
  
  module.exports = mongoose.model('Like', LikeSchema);