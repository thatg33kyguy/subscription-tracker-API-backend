import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { JWT_SECRET } from '../config/env.js'; // Import your JWT secret from config

const authorise = async (req, res, next) => {
    try {
        let token;

        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]; // Extract token from Bearer token
        }

        if(!token){
            return res.status(401).json({message:"Unauthorized access", error: "No token provided"});
        }

        const decoded = jwt.verify(token, JWT_SECRET); // Verify the token

        const user =await User.findById(decoded.userId).select("-password"); // Fetch user without password

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        req.user=user; // Attach user to request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        res.status(401).json({message:"Unauthorized access", error: error.message});
    }
}

export default authorise; // Export the middleware for use in routes