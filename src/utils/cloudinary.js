import {v2 as cloudinary} from "cloudinary"
import  fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_SECRET_KEY  // Click 'View API Keys' above to copy your API secret
});


const uploadOnCloudinary = async (localFilePath)=>{
   try {
      if (!localFilePath) return null // when file is not avialable

      const reponse =await cloudinary.uploader.upload( localFilePath, { 
        resource_type:"auto"
      })
       console.log("this is the response of cloudinary", reponse)
      fs.unlinkSync(localFilePath)
      return reponse
   } catch (error) {
      fs.linkSync(localFilePath) // remove the file from the local storage 

      return null
   }
}

export {uploadOnCloudinary}