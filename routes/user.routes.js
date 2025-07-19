import { Router } from "express";
import authorise from "../middlewares/auth.middleware.js";
import { 
    getUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} from "../controllers/user.controller.js";
// import User from "../models/user.model.js";

const userRouter = Router();

// --- Public Routes ---
userRouter.get("/", getUsers);
// Note: In a production app, POST /users should be an admin-only route.
userRouter.post("/", createUser); 


userRouter.get("/me", authorise, async (req, res, next) => {
  try {
    res.status(200).json({ user: req.user });
  } catch (error) {
    next(error);
  }
});

userRouter.get("/:id", authorise, getUserById);

userRouter.put("/:id", authorise, updateUser);
userRouter.delete("/:id", authorise, deleteUser);

export default userRouter;
