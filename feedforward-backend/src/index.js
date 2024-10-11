import connectDB from "./config/database.js";
import app from "./app.js";
// import dotenv from 'dotenv';
// dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
    .then(()=>{
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err)=>{
        console.log("MongoDB connection error!!!");
        
    })