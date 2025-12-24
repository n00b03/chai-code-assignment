import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    // const {page = 1, limit = 10} = req.query
    if(!videoId){
        throw new ApiError(404,"video not found")
    }

    const comments = await Comment.find({video : videoId}).populate("owner","username email avatar")

    if(!comments){
        throw new ApiError(404,"no comments found")
    }

    return res.status(200).json(new ApiResponse(200,comments,"comments fetched successfully"))


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params;
    const { content } = req.body;

    if(!content){
        throw new ApiError(400,"content required")
    }

    if(!videoId){
        throw new ApiError(404,"video not found")
    }

    const comment =  await Comment.create({
        content,
        video : videoId,
        owner : req.user._id
    })

    if(!comment){
        throw new ApiError(500,"failed to add comment")
    }

    return res.status(200).json(new ApiResponse(200,comment,"comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { newContent } = req.body;

    if(!newContent){
        throw new ApiError(400,"new content required")
    }
 
    const comment = await Comment.findOneAndUpdate({
        _id : commentId,
    },{
        content : newContent
    },{
        new:true
    })

    if(!comment){
        throw new ApiError(404,"comment not found")
    }

    return res.status(200).json(new ApiResponse(200,comment,"comment updated successfully"  ))
})

const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    if(!commentId){
        throw new ApiError(404,"comment not found")
    }

    const deletedComment = await  Comment.findOneAndDelete({
        _id : commentId,
        owner : req.user._id
    })

    if(!deletedComment){
        throw new ApiError(404,"comment not found or you are not the owner")
    }

    return res.status(200).json(new ApiResponse(200,deletedComment,"comment deleted successfully"  ))
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
