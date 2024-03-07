import AppError from '../utils/error.util.js';
import User from "../models/user.model.js";
import user from '../models/user.model.js';

const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 100,
    httpOnly : true,
    secure : true
}

const register = async (req, res, next) =>{

    //getting the required data from the req.body that is defined in schema
    const {fullName, email, password} = req.body;

    if(!fullName || !email || !password){
        //Created a custom middleware that throw new error as per message and status code
        return next(new AppError("All Fields are Required", 400));
    }
    // Checking the user with the email already exists or not
    const userExist =  await User.findOne({email});

    if(userExist) {
        return next(new AppError("User Already Exist", 400))
    }

    // Creating user
    const user = await User.create({
        fullName,
        email,
        password,
        avatar : {
            public_id : email,
            secure_url : 'https://images.unsplash.com/photo-1682688759350-050208b1211c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }
    });

    if(!user){
        return next(new AppError("User registration failed", 400))
    }
     
    // TODO -> File Upload

    await user.save();

    user.password = undefined;

    const token = await user.generateJWTToken();

    res.cookie('token', token, cookieOptions);


    res.status(201).json({
        success : true,
        message : 'User Registered Successfully',
        user,
    })
}

const login = async (req, res, next) =>{

    try {
        const { email, password} = req.body;
        if(!email || !password){
            return next(new AppError("All Fields are required", 400));
        }
        const user = await User.findOne({email}).select('+password');
    
        if(!user || !user.comparePassword(password)){
            return next(new AppError("Email or password does not match", 400));
        }
        const token = await user.generateJWTToken();
        user.password = undefined;
        res.cookie('token', token, cookieOptions);
    
        res.status(200).json({
            success: true,
            message : "User  Logged In Succesfully",
            user
        });
        
    } catch (error) {   
        return next(new AppError(error.message, 400));
    }
   

}

const logout = (req, res) => {
    res.cookie('token', null , {
        secure : true,
        maxAge : 0,
        httpOnly : true
    });
    res.status(200).json({
        success : true,
        message : "User logged out successfully"
    })
}
const getProfile = async (req, res, next) =>{
   

    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        res.status(200).json({
            success : true,
            message : "User Details ",
            user
        })
    } catch (error) {
        return next(new AppError("Failed to fetch user details", 500));
    }
}

export {
    register,
    login,
    logout,
    getProfile
}