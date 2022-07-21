const Errorhandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModels");
const sendToken = require("../utils/jwtToken");

//register a user
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample id",
      url: "profilepicUrl",
    },
  });

  sendToken(user, 201, res);
  // const token =user.getJwtToken();
  // console.log(token)
  // res.status(201).json({
  //     success:true,
  //     //result:user
  //     result:token
  // });
});

//Login user

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  //console.log("hello1", email )
  //checking user given correct email and password

  if (!(email || password)) {
    return next(new Errorhandler("please enter email & password", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  //console.log(user,"hello")
  if (!user) {
    return next(new Errorhandler("invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new Errorhandler("invalid email or password", 401));
  }
  sendToken(user, 200, res);
  // const token =user.getJwtToken();
  // console.log(token)
  // res.status(200).json({
  //     success:true,
  //     //result:user
  //     result:token
  // });
});

//Logout user
exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "logged out",
  });
});

//forget password

exports.forgetPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }

  //get Reset Password token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocal}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your password reset token is :- \n\n ${resetPasswordUrl}
   \n\nif you have not requested this email then please ignor it`;

   try {
       await sendEmail({
           email:user.email,
           subject:"Ecommerce password successfully",
           message,
       });
       res.status(200).json({
           success:true,
           message:`Email sent to ${user.email} successfully`
       })
   } catch (error) {
       user.resetPasswordToken = undefined;
       user.resetPasswordExpire = undefined;

       await user.save({ validateBeforeSave: false });

       return next(new Errorhandler(error.message,500))
   }
});

