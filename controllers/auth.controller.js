import mongoose from "mongoose"
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import  jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

export const signUp = async (req, res, next) => {
    //session is used for atomic updates
    const session = await mongoose.startSession()
    session.startTransaction();
    
    try {
        const {name,email,password}=req.body;
        //if user already exists
        const existingUser=await User.findOne({email});

        if(existingUser){
            const error= new Error('User already exists');
            error.statusCode=409;
            throw error;
        }

        //hash password(encrypt the password)
        const salt= await bcrypt.genSalt(10); //complexity used to randomize the password
        const hashedPassword= await bcrypt.hash(password,salt);

        const newUser=await User.create([{name,email,password:hashedPassword}],{session}); //store the user in db

        const token=jwt.sign({userId:newUser[0]._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN})  //make token of user for auth purposes

        await session.commitTransaction();
        session.endSession()
     
        const { password: _, ...userWithoutPassword } = newUser[0]._doc;

        res.status(201).json({              //send response
            success:true,
            message:"User created Successfully",
            data:{
                token,
                user: userWithoutPassword
            }
        })
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

export const signIn = async (req, res, next) => {
    try {
        const{email,password}=req.body;

        const user= await User.findOne({email});
        if(!user){
            const error =new Error('User Not Found');
            error.statusCode=404;
            throw error;
        }

        const isPasswordValid= await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            const error =new Error('Invalid Password');
            error.statusCode=401;       //unauthorized
            throw error;
        } 

        const token=jwt.sign({userId:user._id},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN})  //make token of user for auth purposes

        res.status(200).json({              //send response
            success:true,
            message:"User signed in successfully",
            data:{
                token,
                user
            }
        })
    } catch (error) {
        next(error);
    }
}

export const signOut = async (req, res, next) => {}