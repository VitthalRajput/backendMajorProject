import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler(async (req, res)=>{

    // get user details from the frontent
    // validation - check empty
    // check if user already exists : username, or email
    // check for image, check for avatar(avatar is compulsury)
    // create user object - create entry in database



    const {fullName, email, username, password} = req.body; 

    // if(fullName === ""){
    //     throw new ApiError(400, "fullName is required")
    // }
    if([fullName, email, username, password].some((field)=>
        field?.trim() === "")){
            throw new ApiError(400, "All Fields are required",);
    }

    const existedUser = User.findOne({
        $or : [{ username }, { email }]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exists");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw ApiError(400, "avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath); 

    if(!avatar){
        throw new ApiError(400, "avatar field is required");  
    }

    const user = await User.create({  //db is in another continent, time+ chances of error
        fullName,
        avatar : avatar.url, // avatar is 100% there at this moment
        coverImage : coverImage?.url || "" , //coverimage ke liye koi validation nahi kiya hai, 
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered sucessfully")
    )

})


export {registerUser}
