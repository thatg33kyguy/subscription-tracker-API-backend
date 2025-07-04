import User from "../models/user.model.js";

export const getUsers= async(req,res,next) => {
    try{
        const users=await User.find({}).select("-password"); // Exclude password and __v field
        res.status(200).json({
            success:true,
            message:"Users fetched successfully",
            data:users
        });
    }catch(error){
        next(error);
    }
}

export const getUserById= async(req,res,next) => {
    try{
        const user=await User.findById(req.params.id).select("-password"); // Exclude password and __v field
        if(!user){
            const error = new Error('User Not Found');
            error.statusCode = 404; // Not Found
            throw error;
        }
        res.status(200).json({
            success:true,
            message:"User fetched successfully",
            data:user 
        });
    }catch(error){
        next(error);
    }
}