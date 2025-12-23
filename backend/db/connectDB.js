import mongoose from "mongoose";

const connectDB = async (url) => {
    console.log("🚀 Trying to connect to MongoDB...");
    console.log("🔗 URL:", url);

    try {
        const conn = await mongoose.connect(url);
        console.log("✅ MongoDB connected:", conn.connection.host);
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
    }
};

export default connectDB;

