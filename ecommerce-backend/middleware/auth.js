const Errorhandler = require("../utils/errorHandler");
const catchAsyncError = require("./catchAsyncError");
const jwt = require("jsonwebtoken");
const User = require("../models/userModels");

exports.isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const { token } = req.cookies;
  //console.log(token);

  if (!token) {
    return next(new Errorhandler("please login  to access this resource", 401));
  }
//console.log(token)
  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decodedData.id);

  next();
});

//authorize roles

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Errorhandler(
          `Role: ${req.user.role} is not allowed to access this resource`,403
        )
      );
    }
    next();
  };
};
