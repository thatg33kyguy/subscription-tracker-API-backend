import { Router } from "express";
import authorise from "../middlewares/auth.middleware.js";
import { createSubscription,getAllSubscriptions,getSubscriptionDetails,getUserSubscriptions } from "../controllers/subs.controller.js";

const subsRouter = Router();

subsRouter.get('/', getAllSubscriptions);


subsRouter.get('/:id', getSubscriptionDetails);

subsRouter.post('/', authorise, (req, res, next) => {
    createSubscription(req, res, next);
});

subsRouter.put('/:id', (req, res) => {
    res.send({title:'UPDATE subscription details'});
});

subsRouter.delete('/:id', (req, res) => {
    res.send({title:'DELETE subscription'});
});

subsRouter.get('/user/:id',authorise, getUserSubscriptions);

subsRouter.put('/:id/cancel', (req, res) => {
    res.send({title:'CANCEL subscription'});
});

subsRouter.get('/upcoming-renewals', (req, res) => {
    res.send({title:'GET upcoming renewals'});
});

export default subsRouter;
