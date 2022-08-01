const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"please Enter User name"],
        maxLength:[30,"Name cannot exceed 30 characters "],
        minLength:[3,"Name should have 3 charecter "]
    },
    email:{
        type:String,
        required:[true,"please Enter Your Email"],
        unique:true,
        validate:[validator.isEmail,"please enter valid email"]
    },

    password:{
        type:String,
        required:[true,"please enter Your password"],
        minLength:[8,"password should be greater than 8 character"],
        select:false
    },

    avatar:{
        public_id:{
            type:String,
            required:true
        },
        url:{
            type:String,
            required:true
        }
    },

    role:{
        type:String,
        default:"user"
    },
     
    resetPasswordToken:String,
    resetPasswordExpire:Date
    
});

//bcrpt hash password
userSchema.pre("save",async function(next){

    if(!this.isModified("password")){
        next();
    }
    this.password = await bcrypt.hash(this.password,10)
})


//json web token(jwt)
userSchema.methods.getJwtToken = function (){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE,
    });
}

//compare password

userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}

//Genrating password reset token
userSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    
    //hashing and resetpasswordToken to userschema
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
}

module.exports = mongoose.model("User",userSchema)