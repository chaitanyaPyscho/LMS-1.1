import AppError from "../utils/error.util.js";
import User from "../models/user.model.js";
import cloudinary from "cloudinary";
import { config } from "dotenv";
import fs from "fs/promises";
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

          // fs.rm(`upload/${req.file.filename}`)
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

export { register, login, logout, getProfile };
