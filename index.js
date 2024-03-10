import app from './app.js'
import connectDB from './config/dbConn.js';
import { config } from 'dotenv';

import cloudinary from 'cloudinary';

const PORT = process.env.PORT || 3002;

cloudinary.v2.config({
    cloud_name : process.env.CLOUDINARY_CLOUD_NAME,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET,
});

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is Running on PORT ${PORT} successfully`);
})