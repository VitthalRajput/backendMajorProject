import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { use } from "react";

// controller must be a funtion, 
const registerUser = asyncHandler( async (req, res)=>{

    // get user details from the frontent
    // validation - check empty
    // check if user already exists : username, or email
    // check for image, check for avatar(avatar is compulsury)
    // create user object - create entry in database
    // without password and access token
    // return response

    // firsrt getting all the details from the frontens
    const {fullName , email, username, password} = req.body;

    // validation 
    // if(fullName === ""){
    //     throw new ApiError(400, "Fullname is required")
    // }

    if([fullName, email, password, username].some((field)=>
        field?.trim() === "")){
            throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or :[{username}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User already exists")
    }

    // getting local path of avatar and cover image, as multer parses it from the request
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;

    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // let coverImageLocalPath; 
    // if (req.files && req.files.coverImage.length>0 && Array.isArray(req.files.coverImage)) {
    //     coverImageLocalPath = req.files.coverImage[0].path;
    // }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "avatar field is required ");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username : username.toLowerCase(),
        avatar : avatar.url,
        coverImage : coverImage?.url || ""

    })


})