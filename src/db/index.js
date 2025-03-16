import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB =async()=>{
    try {
         const ConnectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(` n/ MONGO_DB Connected !! DB HOST: ${ConnectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("MONGO_DB CONNECTION FAILED:", error)
        process.exit(1);
    }
}

export default connectDB