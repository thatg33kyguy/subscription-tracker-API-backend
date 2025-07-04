import { Router } from "express";
import authorise from "../middlewares/auth.middleware.js";
import { getUserById, getUsers } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.get('/', getUsers);

userRouter.get('/:id',authorise, getUserById);      // Use authorise middleware to protect this route

userRouter.post('/', (req, res) => {
    res.send({title:'Create a new user'});
});

userRouter.put('/:id', (req, res) => {
    res.send({title:'UPDATE user details'});
});

userRouter.delete('/:id', (req, res) => {
    res.send({title:'DELETE user'});
});

export default userRouter;
