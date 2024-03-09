import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import { config } from "dotenv";
import fs from "fs/promises";
import sendEmail  from "../utils/sendEmail.js";
config();

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 100,
  httpOnly: true,
  secure: true,
};

// config 
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const register = async (req, res, next) => {
  //getting the required data from the req.body that is defined in schema
  try {
    const { fullName, email, password } = req.body;
    console.log(fullName, email, password);
    if (!fullName || !email || !password) {
      //Created a custom middleware that throw new error as per message and status code
      return next(new AppError("All Fields are Required", 400));
    }
    // Checking the user with the email already exists or not
    const userExist = await User.findOne({ email });

    if (userExist) {
      return next(new AppError("User Already Exist", 400));
    }

    // Creating user
    const user = await User.create({
      fullName,
      email,
      password,
      avatar: {
        public_id: email,
        secure_url: process.env.CLOUDINARY_URL,
      },
    });

    if (!user) {
      return next(new AppError("User registration failed", 400));
    }

    // TODO -> File Upload

    console.log("file Details > ", JSON.stringify(req.file));

    if (req.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
          width: 250,
          height: 250,
          gravity: "faces",
          crop: "fill",
        });
        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;

          fs.rm(`upload/${req.file.filename}`)
        }
      } catch (error) {
        return next(new AppError(error || "File not uploaded", 500));
      }
    }

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError("All Fields are required", 400));
    }
    const user = await User.findOne({ email }).select("+password");

    if (!user || !user.comparePassword(password)) {
      return next(new AppError("Email or password does not match", 400));
    }
    const token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "User  Logged In Succesfully",
      user,
    });
  } catch (error) {
    return next(new AppError("Error While Logging in ", 400));
  }
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
};
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    res.status(200).json({
      success: true,
      message: "User Details ",
      user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetch user details", 500));
  }
};

const forgotPassword  = async (req, res, next) =>{
    const {email} = req.body;

    if(!email){
        return next(new AppError("Email is Required", 400));
    }
    const user = User.findOne({email});

    if(!user){
        return next(new AppError("Email is not registered", 400));
    }
    const resetToken = await user.generatePasswordResetToken;
    await user.save;

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Reset Password - '
    const message = `${resetPasswordUrl}`;
    try {
        await sendEmail(email, subject, message);
        req.status(200).json({
            success : true,
            message : `Reset password mail has been sent to ${email} successfully`
        })
    } catch (e) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save;
        return next(new AppError(e.message, 500));
    }

};

const resetPassword = async (req, res, next) =>{
    const {resetToken } = req.params;
    const { password} = req.body;

    const forgotPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')

    const user = await  User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry : {
            $gt : Date.now()
        }
    });

    if(!user){
        return next(new AppError("Token is Invalid/expired please try again",400 ));
    }
    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    res.status(200).json({
        success : true,
        message : "Your password changed successfully"
    })
};

const changePassword = async (req, res, next) =>{
    const {oldPassword, newPassword}  = req.body;
    const {id} = req.user;
    if(!oldPassword || !newPassword){
        return next(new AppError("All field are mandatory", 400));
    }

    const user = await User.findById(id).select('+password');

    if(!user){
        return next(new AppError("User does not exists", 400));
    }

    const isPasswordValid = await user.comparePassword(oldPassword);
    if(!isPasswordValid){
        return next(new AppError("Invalid old password ", 400));
    }
    user.password = newPassword;
    await user.save();

    user.password = undefined;

    res.status(200).json({
        success : true,
        message : "Password Changed Successfully"
    })
}
const updateUser = async(req, res, next) =>{
    const {fullName} = req.body;
    const {id} = req.user.id;

    const user = await User.findById(id);

    if(!user){
        return next(new AppError("User does not exits", 400));
    }

    if(req.fullName){
        user.fullName = fullName;
    }

    if(req.file){
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
        try {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
              folder: "lms",
              width: 250,
              height: 250,
              gravity: "faces",
              crop: "fill",
            });
            if (result) {
              user.avatar.public_id = result.public_id;
              user.avatar.secure_url = result.secure_url;
    
              fs.rm(`upload/${req.file.filename}`)
            }
          } catch (error) {
            return next(new AppError(error || "File not uploaded", 500));
          }
    }
    await user.save();
    res.status(200).json({
        success: true,
        message : "User details updated Successfully"
    })

}

export {
         register,
         login,
         logout,
         getProfile,
         forgotPassword,
         resetPassword,
         changePassword,
         updateUser
     };
