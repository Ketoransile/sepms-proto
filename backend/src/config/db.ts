import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        const err = error as Error;
        console.error(`❌ MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
