import express from "express" 
import { isAuthenticated, login, logout, register, sendVerifyOtp, verifyEmail } from "../controllers/authController.js";
import userAuth from "../middleware/userAuth.js";
const authRouter = express.Router();


authRouter.post('/register' , register);
authRouter.post('/login' , login);
authRouter.post('/logout' , logout);
authRouter.post('/sendVeifyOtp' , userAuth , sendVerifyOtp)  //before sending otp just add user id to req.body then go to send Verifyotp 
authRouter.post('/verifyAccount' ,userAuth , verifyEmail)
authRouter.post('/isAuth' ,userAuth , isAuthenticated)



export default authRouter ;