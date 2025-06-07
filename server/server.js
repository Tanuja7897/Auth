import express from "express" ;
import cors from "core" ;
import 'dotenv/config';
import cookieParser from "cookie-parser"; 

const app = express() ;
app.use(express.json()) ;

app.listen(3000 , ()=>{
    console.log("server started");
})

