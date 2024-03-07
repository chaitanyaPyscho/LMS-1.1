import app from './app.js'
import connectDB from './config/dbConn.js';
import { config } from 'dotenv';

const PORT = process.env.PORT || 3002;

app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is Running on PORT ${PORT} successfully`);
})