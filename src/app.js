import express from "express"
// --
import cors from "cors"
import cookieParser from "cookie-parser"
//  ye dono app bn ne ke baad configure hote hai


const app = express()
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true

})) // for configuring
app.use (express.json({limit: "16kb"})) // json to js object
app.use(express.urlencoded({extended : true, limit:"16kb"})) //form se data to object, nested object
app.use(express.static("public")) // public file for images, css.js files
app.use(cookieParser()) 


//routes import 
import userRouter from './routes/user.routes.js'

// 
app.use("/api/v1/users", userRouter);

export {app}