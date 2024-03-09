import express from 'express';
import cookieParser from 'cookie-parser'
import cors  from 'cors'
import morgan from 'morgan';
import userRoute from './routes/userRoutes.js'
import courseRoute from './routes/course.routes.js'
import errorMiddleware from './middlewares/error.middlewares.js'
// import upload from './middlewares/multer.middleware.js';

const app = express();

app.use(express.json()); 
app.use(morgan('dev'));
app.use(cors({
    origin : [process.env.FRONTEND_URL],
    credentials: true
}))

app.use(cookieParser());

app.use('/ping', (req, res) =>{
    res.send("Pong");
})
app.use('/home', (req, res) => {
    res.send("<h1>Welcome to the home page</h1>");
})
// app.all('/*', (req,res) =>{
//     res.status(404).send("OOPS 404!! Page not Found");
// })

app.use('/api/v1/user', userRoute);
app.use('/api/v1/courses', courseRoute);

app.use(express.urlencoded({extended: true}));

app.use(errorMiddleware);

export default app;