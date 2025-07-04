import Subscription from "../models/subscription.model.js";
import { workflowClient } from "../config/upstash.js";
import { SERVER_URL } from "../config/env.js";

export const createSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.create({
      ...req.body,
      user: req.user._id, //comes from the authorize middleware
    });

    const {workflowRunId} = await workflowClient.trigger({
      url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
      body: {
        subscriptionId: subscription.id,
      },
      headers: {
        "content-type": "application/json",
      },
      retries: 0,
    });

    res.status(201).json({ success: true, data: subscription, workflowRunId });
  } catch (error) {
    next(error);
  }
};

export const getUserSubscriptions = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) {
      //.id is the string version of ._id
      return res
        .status(401)
        .json({
          success: false,
          message: "You are not authorized to view this user's subscriptions.",
        });
    }
    const subscriptions = await Subscription.find({ user: req.user._id });
    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "No subscriptions found for this user.",
        });
    }

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};

export const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({});
    if (!subscriptions || subscriptions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No subscriptions found." });
    }

    res.status(200).json({ success: true, data: subscriptions });
  } catch (error) {
    next(error);
  }
};
export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const details = await Subscription.find({ name: req.params.id }).lean();
    if (!details || details.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No subscription details found." });
    }

    const filteredDetails = details.map(({ _id, user, ...rest }) => rest);
    res.status(200).json({ success: true, data: filteredDetails });
  } catch (error) {
    next(error);
  }
};
