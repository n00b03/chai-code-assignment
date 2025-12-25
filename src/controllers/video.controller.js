import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary , cloudDelete } from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const videos = await Video.find({});

    if(!videos){
        throw new ApiError(400,"unable to fetch videos")
    }

    return res.status(200).json(new ApiResponse(200,videos,"fetching successful"))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    if(!title || !description) {
        throw new ApiError(400,"all fields required")
    }

    const videoFilelocalpath = req.files?.videoFile?.[0]?.path;
    const thumbnaillocalpath = req.files?.thumbnail?.[0]?.path;

    if(!videoFilelocalpath || !thumbnaillocalpath){
        throw new ApiError(400,"all files required")
    }

    const videoFile = await uploadOnCloudinary(videoFilelocalpath);
    const thumbnail = await uploadOnCloudinary(thumbnaillocalpath);

    if(!videoFile || !thumbnail){
        throw new ApiError(500,"unable to upload file");
    }

    const video = await Video.create({
        title,
        description,
        duration: videoFile.duration,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        publicId: {
            videoPublicId: videoFile.public_id,
            thumbnailPublicId: thumbnail.public_id
        },
        owner: req.user._id
    })

    if (!video) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,video,"video upload successfuly"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video not found")
    }

    return res.status(200).json(new ApiResponse(200,video,"fetching successful"))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   
    if(!videoId){
        throw new ApiError(400,"unable to find video id")
    }

    const thumbnailPath = req.file?.path

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404,"video not found")
    }
    
    if(thumbnailPath){
        const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailPath);
        const oldThumbnailPublicId = video.publicId?.thumbnailPublicId;
        await cloudDelete(oldThumbnailPublicId,"image");
        
        video.thumbnail = thumbnailUploadResponse.url;
        video.publicId.thumbnailPublicId = thumbnailUploadResponse.public_id;
    }

    await video.save();

    return res.status(200).json(new ApiResponse(200,video,"update successful"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }


    const deletedVideo = await Video.findById(videoId);

    if (!deletedVideo) {
        throw new ApiError(404, "video not found");
    }

    await cloudDelete(deletedVideo.publicId?.videoPublicId,"video");
    await cloudDelete(deletedVideo.publicId?.thumbnailPublicId,"image");

    // Then delete from DB
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json(new ApiResponse(200,deletedVideo,"video deleted successfully"))
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400,"videoId is required")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404,"video not found")
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse(200,video,"publish status toggled successfully"))
})

const getUserVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(401, "Unauthorized or invalid user id");
    }

    const videos = await Video.find({ owner: userId });

    if (videos.length === 0) {
        throw new ApiError(404, "No videos found for this user");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getUserVideos
}
