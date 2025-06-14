//all logic goes here
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import UserModel from "../model/UserModel"

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
        const user = new UserModel({name , email , hashPassword}) ;
        //save(Store) user it db
        await user.save() ;

        //generate token for authentication 
        //and send this token using cookies
        //whenever new user is generate mongodb automatically generates one id that id we are using for generationg token
        //expiresIn is buildin fn
        const token = jwt.sign({id : user._id} , Process.env.JWT_SECRET , {expiresIn : '7d'})

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
        const token = jwt.sign({id : user._id} , Process.env.JWT_SECRET , {expiresIn : '7d'})
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

