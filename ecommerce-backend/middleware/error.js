const Errorhandler = require('../utils/errorHandler');

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "internal server errror";

//wrong datbase (mongodb) Id
    if(err.name==="CastError"){
        const message =`Resource not found. Invalid: ${err.path}`;
        err= new Errorhandler(message,400);
    }


//mongoose duplicate key error
if(err.code === 11000){
    const message= `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err= new Errorhandler(message,400);
}

//wrong JWT error
if(err.name==="JsonWebTokenError"){
    const message =`Json Web Token Is Invalid,Try Again`;
    err= new Errorhandler(message,400);
}

//Jwt expire error
if(err.name==="TokenEpiredError"){
    const message =`Json Web Token Is Expired,Try Again`;
    err= new Errorhandler(message,400);
}

    res.status(err.statusCode).json({
        success:false,
        message:err.message, 
    });
};                                                                      