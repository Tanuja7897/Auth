import mongoose from "mongoose";

async function ConnectDB(){
    mongoose.connection.on('connected',()=>console.log("server connected to database"))
    await mongoose.connect(`${process.env.MONGODB_URI}/mern_auth`) //to access environment valriable
}

export default ConnectDB ;