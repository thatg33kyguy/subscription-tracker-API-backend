import dayjs from "dayjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import { sendReminderEmail } from "../utils/send-email.js";

import Subscription from "../models/subscription.model.js";

const REMINDERS = [7, 5, 3, 1]; //days before renewal date to send reminders
export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  console.log(subscriptionId);
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || subscription.status !== "active") {
    return {
      status: 404,
      body: { error: "Subscription not found or inactive" },
    };
  }

  const renewalDate = dayjs(subscription.renewalDate);
  if (renewalDate.isBefore(dayjs())) {
    console.log(
      `Subscription ${subscriptionId} is inactive, renewal date is in the past.`
    );
    return {
      status: 400,
      body: { error: "Subscription is inactive, renewal date is in the past." },
    };
  }

  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day");
    if (reminderDate.isAfter(dayjs())) {
      await sleepUntilReminder(
        context,
        `Reminder for ${subscriptionId} in ${daysBefore} days`,
        reminderDate
      );
    }
    if (dayjs().isSame(reminderDate, "day")) {
      await triggerReminder(
        context,
        `Reminder for ${subscriptionId} in ${daysBefore} days`,
        subscription,
        daysBefore
      );
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email"); //basically join User to Subscription to get email and ame referenced in Subscription
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${date} for ${label}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription, daysBefore) => {
  return await context.run(label, async () => {
    console.log(`Triggering reminder for ${label}`);
    // Here you would send the actual reminder, e.g., via email or notification
    await sendReminderEmail({
      to: subscription.user.email,
      type: `${daysBefore}days`,
      subscription,
    });
    return { status: "Reminder sent", label };
  });
};
