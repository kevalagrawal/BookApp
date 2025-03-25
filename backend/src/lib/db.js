import mongoose from 'mongoose'

export const connectDB = async()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Database Connected ${conn.connection.host}`);
    } catch (error) {
        console.log("Error in database connection",error);
        process.exit(1); //failure
    }
}