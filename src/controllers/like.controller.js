import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const  userId  = req.user._id;

    if(!videoId){
        throw new ApiError(400,"unable to like video")
    }

    if(!userId){
        throw new ApiError(400,"you are not logged in")
    }

    const isLiked = await Like.findOne({
        video : videoId,
        likedBy : userId
    })

    if(!isLiked){
        const liked = await Like.create({
            video : videoId,
            likedBy : userId
        })

        if(!liked){
            throw new ApiError(400,"unable to like video")
        }

        return res.status(200).json(new ApiResponse(200,liked,"video Liked Successfully"))
    }

    await Like.findOneAndDelete({
        video : videoId,
        likedBy : userId
    })

    return res.status(200).json(new ApiResponse(200,null,"video unliked successfully"))

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const  userId  = req.user._id;

    if(!commentId){
            throw new ApiError(400,"unable to like comment")
        }

    if(!userId){
            throw new ApiError(400,"you are not logged in")
    }

        const isLiked = await Like.findOne({
            comment : commentId,
            likedBy : userId
        })

        if(!isLiked){
            const liked = await Like.create({
                comment : commentId,
                likedBy : userId
            })

            if(!liked){
                throw new ApiError(400,"unable to like comment")
            }

            return res.status(200).json(new ApiResponse(200,liked,"comment Liked Successfully"))
        }

        await Like.findOneAndDelete({
            comment : commentId,
            likedBy : userId
        })

        return res.status(200).json(new ApiResponse(200,null,"comment unliked successfully"))
    }

)

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const  userId  = req.user._id;

    if(!tweetId){
            throw new ApiError(400,"unable to like tweet")
        }

    if(!userId){
            throw new ApiError(400,"you are not logged in")
    }

        const isLiked = await Like.findOne({
            tweet : tweetId,
            likedBy : userId
        })

        if(!isLiked){
            const liked = await Like.create({
                tweet : tweetId,
                likedBy : userId
            })

            if(!liked){
                throw new ApiError(400,"unable to like tweet")
            }

            return res.status(200).json(new ApiResponse(200,liked,"tweet Liked Successfully"))
        }

        await Like.findOneAndDelete({
            tweet : tweetId,
            likedBy : userId
        })

        return res.status(200).json(new ApiResponse(200,null,"tweet unliked successfully"))
    }
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if(!userId){
        throw new ApiError(400,"you are not logged in")
    }

    const likedVideos = await Like.find({likedBy : userId , video : {$exists : true}}).populate("video");

    return res.status(200).json(new ApiResponse(200,likedVideos,"liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}