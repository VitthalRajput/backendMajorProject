// require('dotenv').config({path : './env'})
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { mongo } from "mongoose";
import { DB_NAME } from "./constants.js";

dotenv.config({
    path : './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Server is running at ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("MONGO DB connection Failed !!", error)

})


// function connectDB(){}

// connectDB()

// another best approach

// ()() ==> ifiii

/*
import express from "express"
const app = express() //creating app using express
;(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on ("error", (error)=>{
        console.log("ERRR:", error);
        throw error

       })

       app.listen(process.env.PORT,()=>{
        console.log (`App is listening on port ${process.env.PORT}`)
       })

    } catch (error) {
        console.log(error);
    }
})()
    */
