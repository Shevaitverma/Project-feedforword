import mongoose from "mongoose";

// Define the Comment Schema
const CommentSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true,
      },
      text: {
        type: String,
        required: [true, 'Comment text is required'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters'],
      }
    },
    {
      timestamps: false,
    }
  );
  
  // Optional: Index to improve query performance for comments on a specific post
  CommentSchema.index({ postId: 1, date: -1 });
  
  const Comment = mongoose.model('Comment', CommentSchema);
  export default Comment;