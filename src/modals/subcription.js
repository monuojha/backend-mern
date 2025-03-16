import mongoose, { Schema } from "mongoose";

const subscriptionSchema= new Schema(
    {

        subscriber:{
            type:Schema.Types.ObjectId, // one how is subcrebing,
            ref: "User"
        },
        channel:{
            type:Schema.Types.ObjectId, // one have a channel
            ref: "User"
        }
    },
    {
        timestamps:true
    }
)

 export const Subscription = mongoose.model("Subscription", subscriptionSchema)