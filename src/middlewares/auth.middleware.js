import {asyncHandler } from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../modals/user.modals.js"
export const verifyJWT = asyncHandler( async(req, _, next)=>{
try {
    const token = req.cookies?.accessToken || req.header( "Authorization")?.replace( "Bearer", "")
    
    
    
    if (!token){
        throw new ApiError( 400, "Unauthorized user")
    }
    
    const decodToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    const user = await User.findById(decodToken?._id).select( "-password, -refreshToken")
    if (!user){
        throw new ApiError( 401, "invalid Access Token")
    }

    req.user = user
    next()
    
} catch (error) {
    throw new ApiError( 400, error?.massage || " Invalid Access Token")
}
})