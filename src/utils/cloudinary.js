import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import { asyncHandler } from "./asyncHandler.js";
import { ApiError } from "./ApiError.js";


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}

const cloudDelete = async (publicId,restype) => {
  try {
    if (!publicId) {
      console.warn("Public ID is missing or undefined");
      return null;
    }
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: restype,
    });

    return result;
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    throw new ApiError(400, "Cloudinary delete error: " + err.message);
  }
};




export {uploadOnCloudinary, cloudDelete}