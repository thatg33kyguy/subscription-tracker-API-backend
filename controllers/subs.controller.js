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

export const deleteSubscription = async (req, res, next) => {
  try {
    const deleted = await Subscription.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Subscription not found." });
    }

    res.status(200).json({ success: true, message: "Subscription deleted successfully." });
  } catch (error) {
    next(error);
  }
};


export const cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found or unauthorized.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully.',
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};


export const updateSubscription = async (req, res, next) => {
  try {
    // Filter out undefined values
    const updates = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }

    const updated = await Subscription.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or unauthorized.",
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};


export const getUserUpcomingRenewals = async (req, res, next) => {
  try {
    const userId = req.params.userId;

    const now = new Date();
    const oneMonthLater = new Date();
    oneMonthLater.setDate(now.getDate() + 30); // or use moment.js for precision

    const upcoming = await Subscription.find({
      user: userId,
      renewalDate: { $gte: now, $lte: oneMonthLater },
      status: 'active'
    }).sort({ renewalDate: 1 });

    res.status(200).json({
      success: true,
      count: upcoming.length,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};
