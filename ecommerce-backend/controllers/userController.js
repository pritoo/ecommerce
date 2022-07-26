const Errorhandler = require("../utils/errorHandler");
const catchAsyncError = require("../middleware/catchAsyncError");
const User = require("../models/userModels");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

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
  //console.log(user)
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }

  //get Reset Password token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  //console.log(resetToken);
  const resetPasswordUrl = `${req.protocal}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;
  //console.log(resetPasswordUrl)

  const message = `your password reset token is :- \n\n ${resetPasswordUrl}
   \n\nif you have not requested this email then please ignor it`;
  //console.log(message)
  try {
    await sendEmail({
      email: user.email,
      subject: "Ecommerce password Recovery",
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new Errorhandler(error.message, 500));
  }
});


//reset password
exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
    //console.log(resetPasswordToken);
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  console.log(user)
  if (!user) {
    return next(
      new Errorhandler(
        "Reset password token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Errorhandler("password does not match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});


//get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user =await User.findById(req.user.id);

  res.status(200).json({
    'statusCode':'200',
    success:true,
    result:user
  })
});


//update user password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user =await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new Errorhandler("old password incorrect", 400));
  }

  if(req.body.newPassword !== req.body.confirmPassword){
    return next(new Errorhandler("password does not match",400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user,200,res);

  // res.status(200).json({
  //   'statusCode':'200',
  //   success:true,
  //   resule:user
  // })
});


//update user profile
exports.updateProfile= catchAsyncError(async (req, res, next) => {

  const newUserData={
    name:req.body.name,
    email:req.body.email
  }

  //we will add cloudnary later(images)

  const user= await User.findByIdAndUpdate(req.user.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  })

  res.status(200).json({
    success:true,
  });


  // sendToken(user,200,res);
});



//get All users (admin)

exports.getAllUser= catchAsyncError(async (req, res, next) => {

  const users = await User.find();

  res.status(200).json({
    success:true,
    result:users
  })
})

//get single users --admin

exports.getSingleUser= catchAsyncError(async (req, res, next) => {

  const user = await User.findById(req.params.id);

  if(!user){
    return next(new Errorhandler(`user does not exist with id : ${req.params.id}`))
  }

  res.status(200).json({
    success:true,
    result:user
  })
});


//update user role --admin

exports.updateUserRole= catchAsyncError(async (req, res, next) => {

  const newUserData={
    name:req.body.name,
    email:req.body.email,
    role:req.body.role
  }

  const user= await User.findByIdAndUpdate(req.params.id,newUserData,{
    new:true,
    runValidators:true,
    useFindAndModify:false,
  })

  res.status(200).json({
    success:true,
  });


  // sendToken(user,200,res);
});


//delete user  --admin

exports.deleteUser= catchAsyncError(async (req, res, next) => {

  const user =await User.findById(req.params.id)

 //we will remove cloudnary later(image)

 if(!user){
   return next(new Errorhandler(`user does not exist with id:${req.params.id}`))
 }

 await user.deleteOne()
  res.status(200).json({
    success:true,
    message:"user deleted successfully"
  });


  // sendToken(user,200,res);
});