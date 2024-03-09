import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
const getAllCourses = async (req, res, next) =>{

    try {
        const courses = await Course.find({}).select('-lectures');
        res.status(200).json({
        success: true,
        message : "Fetched the Coures successfully",
        courses
    })

    } catch (e) {
        return next(new AppError(e.message, 400))
    }

    
}

const getLecturesByCourseId = async ( req, res, next) =>{ 
    try {
        const {id} = req.params;
        const course = await Course.findById(id);

        res.status(200).json({
            success: true,
            message : "Course Lectures fetched succesfully",
            lectures : course.lectures
        })

    } catch (e) {
        return next(new AppError(e.message, 400))
    }
}

const registerCourses = async (req, res, next) =>{
    try {
        const {title, description, category, numberOfLectures} = req.body;
        //check if the course already exists or not
        const isExist = await Course.findOne({title});
        if(isExist){
            return next(new AppError("Already Exists", 400));
        }
        const user = await User.create({
            title,
             description,
             category,
             numberOfLectures
        })

        res.status(200).json({
            success : true,
            message : "Course Registered succefully"
        })
        
    } catch (e) {
        return next(new AppError(e.message, 400));
    }
}
export {
    getAllCourses,
    getLecturesByCourseId,
    registerCourses
}