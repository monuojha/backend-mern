import {asyncHandler} from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import {ApiError} from "../utils/ApiError.js" 
import {User} from "../modals/user.modals.js"
import mongoose from "mongoose";

const generateAccessAndRefreshToken= async(uersId)=>{
     try {

        const user = await User.findById(uersId)

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforesave:false})
        return {accessToken, refreshToken}
        
     } catch (error) {
        throw new ApiError( 401, "refrsh and access  tockens are not generated")
     }

}
const registerUser = asyncHandler( async (req, res)=>{
// get data from frontend
   const {fullName, email, username, password  }= req.body
   // for checking purpose
   console.log("body data study =>", req.body)
// validation of the data
if ([ fullName, email, username, password].some((fields)=>fields?.trim()==="")){
    throw new ApiError(400, "All fields are require ")
}

// user already exist


 const existedUser =await User.findOne({
    //operate for multiparameter

    $or:[{email},{username}]
})

if (existedUser){
    throw new ApiError(409, "already user is exist")

}

//file 
console.log("for check multer req.file=> ", req.files)
const avatarLocalPath = req.files?.avatar[0]?.path
// const coverImageLocalPath = req.files?.coverImage[0]?.path
let coverImageLocalPath
if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.lenght>0){
    coverImageLocalPath = req.files.coverImage[0].path
}

//check avatar 
if(!avatarLocalPath){
    throw new  ApiError( 400, "Avatar is require")
}


const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImage = await uploadOnCloudinary(coverImageLocalPath)

if (!avatar){
     throw new ApiError( 400, "Avatar file is require")
}


const user = await User.create({
    fullName,
    avatar:avatar.url,
    coverImage:coverImage?.url || "",
    email,
    password,
    username:username
    
})
// for not sent properties use *some
 const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
 )


 if (!createdUser){
    throw new ApiError( 500, "something went wrong while regitrastion the user")
 }
     




    return res.status(201).json(
       new ApiResponse( 201, createdUser, "user register successfully ")
    )
})

const loginUser= asyncHandler( async(req, res)=>{


    const {username, password,email} =req.body
    // console.log("body data study =>", req.body)

    if (!username && !email){
        throw new ApiError( 400, " username or email is require")
    }

      const user = await User.findOne({
        $or:[ {username}, {email}]
    })



    // console.log(user, "user")
    if (!user){
        throw new ApiError( 400, " user is not exist")
    }

     const isPasswordValidat= await user.isPasswordCorrect(password)

     if (!isPasswordValidat){
        throw new ApiError( 400, " incorrect password")
    }

    // console.log(isPasswordValidat, "isPasswordValidat")

    const { accessToken, refreshToken}=await generateAccessAndRefreshToken(user._id)
    // console.log(accessToken, refreshToken)

    // console.log(user._id, "user._id")

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    console.log(loggedInUser, "loggedInUser")

    // console.log("loggedInUser", loggedInUser)

    const option= {
        httpOnly:true,
        secure:true
    }

    res
    .status(200)
    .cookie( "accessToken", accessToken, option )
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const loggedOut = asyncHandler( async (req, res)=>{
  
   await User.findByIdAndUpdate(req.user._id, 
        { 
            $set:{
                refreshToken:undefined
            }
        
        },
        {
            new: true
        }
    )

    const option= {
        httpOnly:true,
        secure:true
    }

    res.status(200)
    .clearCookie("accesstoken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse( 200, {}, "User logged Out"))

})

const refreshAccessToken= asyncHandler(async(req, res)=>{
       const oldRefreshToken= req.body.cookie?.refreshToken || req.body.refreshToken
//  console.log(oldRefreshToken)
       if(!oldRefreshToken){
        throw new ApiError( 401, " Unauthorized Request")
       }

      try {
         const decodedRefreshToken = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET)
  
        //  console.log(decodedRefreshToken)
  
         const user = await User.findById( decodedRefreshToken?._id)
  
         if ( !user){
          throw new ApiError( 401, "Invalid Refresh Token ")
         }

         console.log("user======",user?.refreshToken)
         console.log( "decoded======",decodedRefreshToken)
         //this is working
         //  if(oldRefreshToken!==user?.refreshToken){
            //   throw new ApiError( 401, "Refresh Token is Expired or Used ")
            //  }

            // this is not working
            if(decodedRefreshToken!==user?.refreshToken){
            throw new ApiError( 401, "Refresh Token is Expired or Used ")
           }
  
  
          const {accessToken, newRefreshToken}= await generateAccessAndRefreshToken( user._id)
  
          const option ={
              httpOnly:true,
              secure:true
          }
  
          return res
          .status(200)
          .cookie( "accessToken", accessToken, option)
          .cookie( "refreshToken", newRefreshToken, option)
          .json(new ApiResponse(
              200, {accessToken, "refreshToken":newRefreshToken},
              "Access Token Refershed"
          ))
      } catch (error) {
        throw new ApiError(400, error?.massage || "Invalid Refresh Token")
      }




})

const getUserProfileDetails = asyncHandler(async(req, res)=>{

    const {username}= req.params

    if (!username?.trim()){
        throw new ApiError( 400, "username is missing")
    }

  const channel = await  User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
       {

        $lookup:{
            from:"subscription",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
       },
       {
        $lookup:{
            from:"subscription",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscriberd"
        }
       },
       {
        $addFields:{
            subcriberCount:{
                size:"$subscribers"
            },
            channelSubcribedCount:{
                size:"$subscriberd"
            },
            isSubscribed:{
                $coud:{
                    if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                    then:true,
                    else:false
                }
            }
        }
       },

       {
        $project:{
            fullName:1,
            username:1,
            email:1,
            avatar:1,
            coverImage:1,
            subcriberCount:1,
            channelSubcribedCount:1,
            isSubscribed:1
        }
       }
    ])

    if(!channel?.length){
        throw new ApiError( 400, "User details not comming")
    }

    return res.status(200)
    .json(new ApiResponse( 200, channel[0], " user fetched data successfully" ) )
})


const getWatchHistory = asyncHandler(async(req, res)=>{

    const user = await User.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.user._id)
            }
        },

        {
            $lookup:{

                from: "videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
                pipeline:[
                   { $project:{
                        fullName:1,
                        username:1,
                        avatar:1

                    }}
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, user[0].watchHistory, "fetched user Watched History"))
})


export {registerUser, loginUser, loggedOut, refreshAccessToken, getUserProfileDetails,getWatchHistory}