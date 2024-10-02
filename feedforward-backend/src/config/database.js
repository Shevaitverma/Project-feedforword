import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const connctionInstance = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected!! DB host: ', connctionInstance.connection.host);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB