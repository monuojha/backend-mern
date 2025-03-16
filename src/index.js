// require("dotenv").config({path:" ./.env"});
// import mongoose from "mongoose";
// import { DB_NAME } from "./constant";

import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path:"./env"
});

connectDB()
.then( ()=>{
    app.listen(process.env.PORT || 3000, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
      });
}
    
)
.catch( (error) => {
    console.log(" MONGO db CONNECTION FAILED !!!", error)
});
























// (async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", (error) => {
//       console.log("ERROR", error);
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     })
//   } catch (error) {
//     console.log("ERROR", error);
//     throw error;
//   }
// })();
