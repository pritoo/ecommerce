//create cookie and saving in cookiee

const sendToken =(user,statusCode,res)=>{
    const token =user.getJwtToken();

    //options for cookie

    const options ={
        expires:new Date(
            Date.now()+process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly:true,
    }
    res.status(statusCode).cookie('token',token,options).json({
        success:true,
        result:user,token
        
    })
}

module.exports = sendToken

