import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

// Define the User Schema
const UserSchema = new mongoose.Schema(
    {
      name: {
        type: String,
        trim: true,
        maxlength: [50, 'Name cannot exceed 50 characters'],
      },
      email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address'],
      },
      username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters'],
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
      },
      password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Exclude password field by default when querying
      },
      avatar: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.*\.(jpg|jpeg|png|gif)$/, 'Please provide a valid image URL'],
      },
      bio: {
        type: String,
        trim: true,
        maxlength: [200, 'Bio cannot exceed 200 characters'],
      },
      isVerified: {
        type: Boolean,
        default: false,
      },
      interests: {
        type: [String], // Array of strings representing user interests
        default: [],
      },
      followers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Follower',
        },
      ],
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
  );
  
  // Hash the password before saving the user
  UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
  
    try {
      const saltRounds = 10; // Adjust salt rounds as needed for security/performance
      const salt = await bcrypt.genSalt(saltRounds);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  });
  
// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
  
const User = mongoose.model('User', UserSchema);

export default User;