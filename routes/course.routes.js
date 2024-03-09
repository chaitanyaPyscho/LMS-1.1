import {Router} from  'express';
import { isLoggedIn } from '../middlewares/auth.middleware.js';
import { getAllCourses, getLecturesByCourseId, registerCourses } from '../controller/course.controllers.js';
const router = new Router();


router.route('/')
.get(getAllCourses);

router.route('/:id')
.get(isLoggedIn, getLecturesByCourseId);

router.route('/register')
.post(registerCourses);
export default router; 