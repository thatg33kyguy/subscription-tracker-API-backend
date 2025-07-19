
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET, NODE_ENV } from "../config/env.js";

// --- Helper for Production Cookie Settings ---
// When deploying, cookies must be secure and allow cross-site requests.
const getCookieOptions = () => {
  console.log("NODE_ENV =", NODE_ENV);
  if (NODE_ENV === 'production') {
    return {
      httpOnly: true,
      secure: true,     // ✅ MUST be true for HTTPS (which OnRender uses)
      sameSite: 'none', // ✅ MUST be 'none' for cross-domain cookies
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    };
  }
  // Default settings for local development (HTTP)
  return {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  };
};


// --- SIGNUP ---
export const signUp = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error("User already exists");
      error.statusCode = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create(
      [{ name, email, password: hashedPassword }],
      { session }
    );

    const token = jwt.sign({ userId: newUser[0]._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    await session.commitTransaction();
    session.endSession();

    const { password: _, ...userWithoutPassword } = newUser[0]._doc;

    res
      .cookie("token", token, getCookieOptions()) // Use dynamic cookie options
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        data: {
          user: userWithoutPassword,
        },
      });
  } catch (error) {
    try {
      await session.abortTransaction();
    } catch (_) {}
    session.endSession();
    next(error);
  }
};

// --- SIGNIN ---
export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid password");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const { password: _, ...userWithoutPassword } = user._doc;

    res
      .cookie("token", token, getCookieOptions()) // Use dynamic cookie options
      .status(200)
      .json({
        success: true,
        message: "User signed in successfully",
        data: {
          user: userWithoutPassword,
          token: token,
        },
      });
  } catch (error) {
    next(error);
  }
};

// --- SIGNOUT ---
export const signOut = async (req, res, next) => {
  try {
    res
      .clearCookie("token", getCookieOptions()) // Use dynamic cookie options
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully",
      });
  } catch (error) {
    next(error);
  }
};