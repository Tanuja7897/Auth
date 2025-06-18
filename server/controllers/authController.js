//all logic goes here
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import UserModel from "../model/UserModel.js"
import transporter from "../config/nodeMailer.js"

export const register = async(req , res) =>{
    const {name , email, password} = req.body ;
    if(!name || !email || !password ){
        return res.json({
            success : false ,
            message : "Missing required details"
        })
    }

    try{
        //check if the user is exist before storing it
        const existingUser = await UserModel.findOne({email}) //it user exist it going to give true
        if(existingUser){
            return(res.json({
                success : false ,
                message : "User already exost" 
            }))
        }
        //encrypt the password
        const hashPassword = await bcrypt.hash(password , 10) ;
        const user = new UserModel({name , email , password : hashPassword}) ;
        //save(Store) user it db
        await user.save() ;

        //generate token for authentication 
        //and send this token using cookies
        //whenever new user is generate mongodb automatically generates one id that id we are using for generationg token
        //expiresIn is buildin fn
        const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : '7d'})

        //and this into cookie and send in response 
        res.cookie('token',token,{      //'token '  is cookie name
            httpOnly : true,  //only http request can access this cookie
            secure : process.env.NODE_ENV === 'production',//when i will in develpmetn not secure ... when i am in production phase i use secure
            //when i am working on local host (backend and frontend both are on same machine )this will mark as strict 
            //otherwise this will be none
            sameSite : process.env.NODE_ENV == 'production' ? none : 'strict' ,
            //we have to give expire date in millisecons 
            maxAge : 7 * 24 * 60 * 60 * 1000
        }) 
        
        //add the script to send email 
        //sending welcome email 
        const mailOptions = {
            //sender email in env
            from : process.env.SENDER_EMAIL,
            to : email ,   //to the mail presend in request body
            subject : "Wlecome to Mern Auth",
            text : `Welcome to Mern Auth your account hasbeen successfully created with email ${email}`
        }

        await transporter.sendMail(mailOptions)

        return res.json({success : true})

    }catch(err){
        res.json({
            success : false,
            message : "error occured at creation ",
            error : err.message 
        })
    }
}


//controller fn for user login
//while login we will only need email and password
export const login = async (req , res) =>{
    const {email , password} = req.body ;

    if(!email || !password){
        return res.json({
            success : false ,
            message : "email and password are required"
        })
    }

    try{
        //find the user by email id
        const user = await UserModel.findOne({email}) ;
        if(!user){
            res.json({
                success : false ,
                message : "User does not exist Invalid email" 
            })
        }
        
        //if user exist 
        //compare password user prodided and db store password
        
        const isMatch = await bcrypt.compare(password , user.password)  //second one is from db

        if(!isMatch){
            return res.json({
                success : false ,
                message : "Invalid password"
            })
        }

        //email and password is correct
        //create one token and user will loged in using this token
        const token = jwt.sign({id : user._id} , process.env.JWT_SECRET , {expiresIn : '7d'})
        res.cookie('token',token,{
            httpOnly : true,  
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV == 'production' ? none : 'strict' ,
            maxAge : 7 * 24 * 60 * 60 * 1000
        }) 
        return res.json({success : true})

    }catch(err){
        return res.json({
            success : false ,
            message : err.message
        })
    }
}

export const logout = async (req , res) => {
    try{
        //clear cookie from response 
        res.clearCookie('token' , {
            httpOnly : true,  
            secure : process.env.NODE_ENV === 'production',
            sameSite : process.env.NODE_ENV == 'production' ? none : 'strict' ,
            maxAge : 7 * 24 * 60 * 60 * 1000
        })

        return res.json({
            success : true ,
            message : "loged Out!"
        })
    }catch(err){
        return res.json({
            success : false ,
            message : err.message
        })
    }
}

//send verification otp to user email
export const sendVerifyOtp = async(req , res) =>{
    try{
        const {userId} = req.body ;
        const user = await UserModel.findById(userId) 
        if(user.isAccountVerified == true){
            //user already verified
            return res.json({
                success : false ,
                message : "already verified"
            })
        }
        //generate random otp
        const otp = String(Math.floor(100000 + Math.random() * 900000)) 

        //save otp in db for this particular user
        user.verifyOtp = otp ;
        //set expire at  (in millisecond 1 day)
        user.verifyOtpExpireAt = Date.now() + 24*60*60*1000 

        await user.save() ;

        //now send otp to user
        //1.create mailOptions
        const mailOptions = {
            //sender email in env
            from : process.env.SENDER_EMAIL,
            to : user.email ,   //to the mail presend in request body
            subject : "Account Verification OTP ",
            text : `Your otp is ${otp}`
        }


        //2 . send the email
        transporter.sendMail(mailOptions)
        res.json({
            success : true ,
            message : "Otp send to user email "
        })

    }catch(err){
        res.json({
            success : false ,
            message : err.message
        })
    }
}

// user has otp -> Enter otp into portal => verify it => login
//Email verify kevl ek br hi hoti hai 
export const verifyEmail = async(req , res) =>{
    const {userId , otp } = req.body ;
    if(!userId || !otp){
        return({
            success : false ,
            message : "missing data"
        })
    }

    try{
        const user = await UserModel.findById(userId) ;
        if(!user){
            return res.json({
                success : false ,
                message : "user not found"
            })
        }
        console.log(user.verifyOtp) ;
        if(user.verifyOtp == '' || user.verifyOtp != otp){
            return res.json({
                success : false ,
                message : "User Invalid" 
            })
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({
                success : false ,
                message : "otp expired"
            })
        }
        //if above condition false
        user.isAccountVerified = true ;
        //now again reset otp and expireAT

        user.verifyOtp = "" 
        user.verifyOtpExpireAt = 0
        await user.save()
        return res.json({
            success : true ,
            message : "OTP Verified"
        })
    }catch(err){
        return res.json({
            success : false ,
            message : err.message 
        })
    }
}

//user_id is present in token 
//token is present in cookie
//we user middleware to get cokkie from that cokkie find token from thta token find user id 
//and append into req.body
//goto middleware folder

//check if user is aleady authenticated or not
export const isAuthenticated = async(req , res)=>{
    try{
        //in the router before this we excute the middleware userAuth.js 
        //if that will true only then this will be executed 
        return res.json({
            success : true
        })
    }catch(err){
        return res.json({
            success : false,
            message : err.message 
        })
    }
}


