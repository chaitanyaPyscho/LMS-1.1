import Course from "../models/course.model.js";
import AppError from "../utils/error.util.js";
import cloudinary from 'cloudinary';
import fs from  'fs/promises'
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

const createCourse = async  (req,res,next)=>{


    const {title, description, category, createdBy} = req.body;

    if(!title || !category || !createdBy){
        return next(
            new AppError("All fields are mandotory", 400)
        );
    }
    const course = await Course.create({
        title, 
        description,
        category,
        createdBy,
        thumbnail : {
            public_id : 'Dummy',
            secure_url : 'Dummy',
        }
    });

    if(!course) {
        return next(new AppError("Course could not be created Try Again!!", 500));
    }
    if(req.file){
        const result = await cloudinary.v2.uploader.upload(req.file.path,{
            folder : 'lms'
        });
        if(result){
            course.thumbnail.public_id = result.public_id;
            course.thumbnail.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`); 
    }
    await course.save();

    res.status(200).json({
        success:true,
        message : "Course Created Successfully",
        course
    })
}
const updateCourse = async (req, res, next) => {
    try {
        const {id} = req.params;
        const course = await Course.findByIdAndUpdate(
            id,
            {
                $set : req.body
            },
            {
                runValidators: true
            }
        );

        if(!course){
            return next(new AppError("course with given id does not exists", 400))
        }

        res.status(200).json({
            success : true,
            message : "Course updated Successfully",
            course
        })
    } catch (error) {
        return next(new AppError(error.message, 400))
    }
}
const removeCourse = async (req, res, next) =>{

}
export {
    getAllCourses,
    getLecturesByCourseId,
    createCourse,
    updateCourse,
    removeCourse
}