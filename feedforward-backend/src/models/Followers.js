import mongoose from mongoose;

// Define the Follower Schema
const FollowerSchema = new mongoose.Schema(
    {
      followedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      followsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      }
    },
    {
      timestamps: false, // No need for createdAt and updatedAt since 'date' captures when the follow occurred
    }
  );

// Prevent duplicate follow relationships
FollowerSchema.index({ followedBy: 1, followsTo: 1 }, { unique: true });

const Follower = mongoose.model('Follower', FollowerSchema);
export default Follower;