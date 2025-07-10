import express from 'express';

import {PORT} from './config/env.js'
import cors from 'cors';
import subsRouter from './routes/subs.routes.js';
import userRouter from './routes/user.routes.js';
import authRouter from './routes/auth.routes.js';
import connectDB from './database/mongodb.js';
import errorMiddleware from './middlewares/error.middleware.js';
import cookieParser from 'cookie-parser';
import arcjetMiddleware from './middlewares/arcjet.middleware.js';

import workflowRouter from './routes/workflow.routes.js';

const app=express();
app.use(cors({
  origin: 'http://localhost:5173', // your frontend origin
  credentials: true,              // allow cookies
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));   //process form data in a simple way
//cookieParser is used to parse cookies from the request headers
app.use(cookieParser());
app.set("trust proxy", true); 
app.use(arcjetMiddleware); // Apply Arcjet middleware for rate limiting and bot detection

app.use('/api/v1/subscriptions',subsRouter);
app.use('/api/v1/users',userRouter);
app.use('/api/v1/auth',authRouter);
app.use('/api/v1/workflows',workflowRouter);

app.use(errorMiddleware);

app.get('/',(req,res)=>{
    res.send('Hi this is api speaking')
});

app.listen(PORT,async ()=>{
    console.log(`Subscription tracker API running on http://localhost:${PORT}`);

    await connectDB();
})

export default app;