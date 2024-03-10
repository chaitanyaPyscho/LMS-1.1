import {Router} from  'express';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import { getAllCourses, getLecturesByCourseId, createCourse, updateCourse, removeCourse } from '../controller/course.controllers.js';
import upload from '../middlewares/multer.middleware.js'
const router = new Router();


router.route('/')
.get(getAllCourses)
.post(
    upload.single('thumbnail'),
    createCourse
);

router.route('/:id')
.get(isLoggedIn, getLecturesByCourseId)
.put(updateCourse)
.delete(removeCourse);


export default router; 