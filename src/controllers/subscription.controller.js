import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)) throw new ApiError(400,"unable to find channelID")
    
    const subscription = await Subscription.findOne({
        subscriber : req.user._id,
        channel : new mongoose.Types.ObjectId(channelId)
    })

    if(!subscription){
       const newSubscriber = await Subscription.create({
            subscriber : req.user._id,
            channel : new mongoose.Types.ObjectId(channelId)
        })

        return res.status(201).json(new ApiResponse(201,newSubscriber,"subscribed"))
    }

    await Subscription.findOneAndDelete({
        subscriber : req.user._id,
        channel : channelId
    })

    return res.status(200).json(new ApiResponse(200,subscription,"unscubscribe"))

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)) throw new ApiError(400,"unable to find channel")

    const userSubscriber = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "userChannelSubscriber"
            }
        },
        {
            $project : {
                fullname : 1,
                email : 1,
                userChannelSubscriber : 1
            }
        }

    ])

    if(!userSubscriber?.length) throw new ApiError(404,"no subscribrer found")

    return res
    .status(200)
    .json(
     new ApiResponse(200, userSubscriber[0], "User subscriber fetched successfully")
    )
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId) throw new ApiError(400,"unable to find subscriber")

    const subscribedChannels = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscriber",
                as : "subscribedChannels"
            }
        },
        {
            $project : {
                fullname : 1,
                email : 1,
                subscribedChannels : 1
            }
        }
    ])

    if(!subscribedChannels[0].subscribedChannels.length) throw new ApiError(404,"no channel found")

    return res
    .status(200)
    .json(
     new ApiResponse(200, subscribedChannels[0], "User subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}