import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name || !description){
        throw new ApiError(400,"All field required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner : req.user?._id
    })

    if(!playlist){
        throw new ApiError(404,"unable to create playlist")
    }

    return res.status(200).json(new ApiResponse(200,"playlist create successfully"))

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if(!userId){
        throw new ApiError(400,"user not found")
    }

    const playlist = await Playlist.find({ owner : userId }).populate("owner","username avatar email").populate("videos")

    if(!playlist){
        throw new ApiError(400,"unable to get playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"playlist fetch successful"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!playlistId){
        throw new ApiError(400,"playlist not found")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(400,"unable to fetch playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"playlist fetch successful"))
    //TODO: get playlist by id
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"both playlistid and videood require to add video in playlist")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(400,"unable to get playlist")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"video not found")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already exists in playlist");
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res.status(200).json(new ApiResponse(200,playlist,"video add successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400,"fetch playlist or unable to find video")
    }

    const playlist = await Playlist.findById(playlistId);

    if(!playlist){
        throw new ApiError(400,"unable to find playlist")
    }

    const indexdeletedvideo = playlist.videos.indexOf(videoId)

    if(indexdeletedvideo < 0){
        throw new ApiError(400,"unable to find video")
    }

    playlist.videos.splice(indexdeletedvideo,1)

    await playlist.save()

    return res.status(200).json(new ApiResponse(200,playlist,"updated playlist"))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!playlistId){
        throw new ApiError(400,"unable to find playlist")
    }

    const playlist = await Playlist.findOneAndDelete({
        _id : playlistId,
        owner : req.user._id
    })

    if(!playlist){
        throw new ApiError(400,"unable to delete playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"playlist deleted successfully"))
    
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId){
        throw new ApiError(400,"unable to find playlist")
    }

    if(!name || !description){
        throw new ApiError(400,"all field required")
    }

    const playlist = await Playlist.findOneAndUpdate({
        _id : playlistId,
        owner : req.user._id
    },
    {
        $set:{
            name : name,
            description : description
        }
    },
    {
            new : true,
            runValidators : true
    }
   )

    if(!playlist){
        throw new ApiError(400,"unable to fetch playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"updated playlist"))

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
