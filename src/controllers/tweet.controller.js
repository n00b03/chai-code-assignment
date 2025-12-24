import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if(!content){
        throw new ApiError(400,"content required")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user._id
    })

    if(!tweet){
        throw new ApiError(500,"unable to creste tweet")

    }

    return res.status(200).json(new ApiResponse(200,tweet,"tweet created successfully"))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if(!userId){
        throw new ApiError(400,"unable to get user id")
    }

    const tweets = await Tweet.aggregate([
        { $match : {owner : new mongoose.Types.ObjectId(userId)}}
    ])

    return res.status(200).json(new ApiResponse(200,tweets,"fetching successful"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { updatedContent } = req.body

    if(!tweetId){
        throw new ApiError(400,"unable to get tweet")
    }
    if(!updatedContent){
        throw new ApiError(400,"unable to get content")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set : {
                content : updatedContent
            }
        },
        {new:true}
    )

    return res.status(200).json(new ApiResponse(200,updatedTweet,"tweet updated"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if(!tweetId){
        throw new ApiError(400,"unable to find tweet")
    }

    const deletedTweet = await Tweet.deleteOne({_id:tweetId,owner: req.user._id})

    if (deleteTweet.deletedCount === 0) {
        throw new ApiError(404, "tweet not found");
    }

    return res.status(200).json(new ApiResponse(204,deletedTweet,"content deleted"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
