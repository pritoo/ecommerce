const Errorhandler = require('../utils/errorHandler');

module.exports = (err,req,res,next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "internal server errror";

//wrong datbase (mongodb) Id
    if(err.name==="CastError"){
        const message =`Resource not found. Invalid: ${err.path}`;
        err= new Errorhandler(message,400);
    }


    res.status(err.statusCode).json({
        success:false,
        message:err.message, 
    });
};                                                                      