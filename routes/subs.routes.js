import { Router } from "express";
import authorise from "../middlewares/auth.middleware.js";
import { createSubscription,getAllSubscriptions,getSubscriptionDetails,getUserSubscriptions,deleteSubscription, cancelSubscription,updateSubscription,getUserUpcomingRenewals  } from "../controllers/subs.controller.js";

const subsRouter = Router();

subsRouter.get('/', getAllSubscriptions);


subsRouter.get('/:id', getSubscriptionDetails);

subsRouter.post('/', authorise, (req, res, next) => {
    createSubscription(req, res, next);
});

subsRouter.put('/:id', authorise, updateSubscription);

subsRouter.delete('/:id', authorise, deleteSubscription);

subsRouter.get('/user/:id',authorise, getUserSubscriptions);

subsRouter.put('/:id/cancel', authorise, cancelSubscription);

subsRouter.get('/upcoming/:userId', authorise, getUserUpcomingRenewals);


export default subsRouter;
