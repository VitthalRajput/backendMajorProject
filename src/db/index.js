import mongoose from "mongoose"
import { DB_NAME } from "../constants.js"

const connectDB = async() =>{
    try {
        // mongoose apko ek return object deta hai
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        // connection hone ke bad ka response connectionInstance me store ho jaega 
        console.log(`\n MongoDB connected !! DB HOST : ${connectionInstance.connection.host}`) //jha par connention hua hai
    } catch (error) {
        console.log("MongooDB connection FAILED !!", error)
        process.exit(1)
    }
}

export default connectDB



const connectdb = async()=>{
    try {
        const connectionInstance = await mongoose.connection(`${process.env.MONGODB_URI}/${process.env.DB_name}`);
        console.log("Connection stablished sucessfully")
    } catch (error) {
        console.error('error', error);
        process.exit(1);
    }
}