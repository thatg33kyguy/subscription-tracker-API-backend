import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js"; 
import bcrypt from "bcryptjs";

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        next(error);
    }
}

export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        next(error);
    }
}


export const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error("User with this email already exists");
            error.statusCode = 409; // Conflict
            throw error;
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ name, email, password: hashedPassword });
        
        const { password: _, ...userWithoutPassword } = newUser._doc;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userWithoutPassword,
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        if (req.user._id.toString() !== req.params.id) {
            const error = new Error("You are not authorized to update this user");
            error.statusCode = 403; // Forbidden
            throw error;
        }

        if (req.body.password) {
            delete req.body.password;
        }
        
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};


export const deleteUser = async (req, res, next) => {
    try {

        if (req.user._id.toString() !== req.params.id) {
            const error = new Error("You are not authorized to delete this user");
            error.statusCode = 403; // Forbidden
            throw error;
        }


        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            const error = new Error('User Not Found');
            error.statusCode = 404;
            throw error;
        }

        // Also delete all subscriptions associated with this user
        await Subscription.deleteMany({ user: req.params.id });

        res.status(200).json({
            success: true,
            message: "User and all associated subscriptions deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
