import jwt from "jsonwebtoken"

const userAuth = async (req , res , next) => {
    //find token from req.cookie
    const {token} = req.cookies ;
    if(!token){
        return res.json({
            success : false ,
            message : "Not Authorized login again"
        })
    }
    try{

        //decode token 
        const  tokenDecode = jwt.verify(token , process.env.JWT_SECRET) 
        if(tokenDecode.id){
            //add id to body
            req.body = {...req.body}
            req.body.userId = tokenDecode.id
        }else{
            return({
                success : false ,
                message : "Not Authenticated login again"
            })
        }

        next() ;

    }catch(err){
        console.log(err.message)
        return res.json({
            success : false ,
            message : err.message
        })
    }
}

export default userAuth

