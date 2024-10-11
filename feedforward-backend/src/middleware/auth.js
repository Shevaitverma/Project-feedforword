import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler'

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "")
    if (!token) {
      return res.status(401).json({ success: false, message: 'session expired, please login again' });
    }
    // console.log("varification token", token);
    
    const secrete =  process.env.JWT_SECRETE
    // console.log(secrete);
    
    
    const decoded = jwt.verify(token, secrete);
    // console.log(decoded.id);
      
    const user = await User.findById(decoded.id); 
    if (!user){
      return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
    next();
      
  } catch (error) {
      return res.status(401).json({ success: false, message: 'something went wrong during verifying access token!!!' });
  }
});