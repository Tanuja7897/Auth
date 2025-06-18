//in package.json use "type" :  module  ,, to use import export statement other you have to require it
import express from "express" ;
import cors from "cors" ;
import 'dotenv/config';
import cookieParser from "cookie-parser"; 
import ConnectDB from "./config/mongoDB.js"
import authRouter from "./routes/auth_route.js"
import userRouter from "./routes/user_route.js"
const app = express() ;
const port = process.env.PORT || 4000 ;   //if you give any port number then it will run on that otherwise it is run on 4000 port number
ConnectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials : true}))  //so that we can send cookie in response from our server

//Apis End Point (Router)
app.use("/api/auth" , authRouter)
app.use("/api/user" , userRouter)
app.listen(port , ()=>console.log(`server started at ${port}`)) ;

