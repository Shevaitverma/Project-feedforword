import mongoose from "mongoose";

// Define the Post Schema
const PostSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      title: {
        type: String,
        required: [true, 'Post title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters'],
      },
      content: {
        type: String,
        required: [true, 'Post content is required'],
        trim: true,
        maxlength: [5000, 'Content cannot exceed 5000 characters'],
      },
      media: [
        {
          type: String,
          trim: true,
          match: [
            /^https?:\/\/.*\.(jpg|jpeg|png|gif|mp4|mov)$/,
            'Please provide a valid media URL',
          ],
        },
      ],
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Like',
        },
      ],
      comments: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Comment',
        },
      ],
      tags: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ]
    },
    {
      timestamps: true, // Adds createdAt and updatedAt
    }
  );
  
  // Indexes to improve query performance
  PostSchema.index({ userId: 1, date: -1 }); // For fetching posts by a user sorted by date
  PostSchema.index({ tags: 1 }); // For tag-based queries
  
  module.exports = mongoose.model('Post', PostSchema);