
import dayjs from "dayjs";
import utc from 'dayjs/plugin/utc.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { serve } = require("@upstash/workflow/express");
import { sendReminderEmail } from "../utils/send-email.js";

import Subscription from "../models/subscription.model.js";

dayjs.extend(utc);
dayjs.extend(isSameOrAfter); // Use isSameOrAfter plugin

const REMINDERS = [7, 5, 3, 1]; //days before renewal date to send reminders
export const sendReminders = serve(async (context) => {
  const { subscriptionId } = context.requestPayload;
  console.log(`Workflow started for subscription ID: ${subscriptionId}`);
  const subscription = await fetchSubscription(context, subscriptionId);

  if (!subscription || !subscription.user) {
    return {
      status: 404,
      body: { error: "Subscription or associated user not found" },
    };
  }

  // This immediate confirmation email will always be sent upon creation.
  await context.run("Send Confirmation Email", async () => {
    console.log(`Attempting to send immediate confirmation for: ${subscription.name}`);
    await sendReminderEmail({
      to: subscription.user.email,
      type: 'confirmation',
      subscription,
    });
    console.log(`✅📧 Confirmation email sent to ${subscription.user.email} for subscription: ${subscription.name}`);
  });


  if (subscription.status === "inactive") {
    return {
      status: 200,
      body: { message: "Subscription is not active, no reminders will be scheduled." },
    };
  }

  if (subscription.status === "cancelled") {
    return {
      status: 200,
      body: { message: "Subscription is cancelled, no reminders will be scheduled." },
    };
  }

  const renewalDate = dayjs.utc(subscription.renewalDate);
  if (renewalDate.isBefore(dayjs.utc())) {
    return {
      status: 200,
      body: { error: "Subscription renewal date is in the past." },
    };
  }


  for (const daysBefore of REMINDERS) {
    const reminderDate = renewalDate.subtract(daysBefore, "day").startOf('day'); // Use start of day for consistency
    const now = dayjs.utc();


    //used isSameOrAfter for resolveing timezone issues
    // Check if the reminder date is today or in the future
    if (reminderDate.isSameOrAfter(now, 'day')) {
      // The workflow will pause here until the calculated reminder date.
      await sleepUntilReminder(
        context,
        `Future reminder for ${subscriptionId} (${daysBefore} days)`,
        reminderDate
      );
      
      // When the workflow wakes up, it continues from here.
      const currentSub = await fetchSubscription(context, subscriptionId);
      if (currentSub && currentSub.status === 'active') {
          await triggerReminder(
            context,
            `Scheduled reminder for ${subscriptionId} (${daysBefore} days)`,
            currentSub,
            daysBefore
          );
      }
    }
  }
});

const fetchSubscription = async (context, subscriptionId) => {
  return await context.run("get subscription", async () => {
    return Subscription.findById(subscriptionId).populate("user", "name email");
  });
};

const sleepUntilReminder = async (context, label, date) => {
  console.log(`Sleeping until ${date.toISOString()} for ${label}`);
  await context.sleepUntil(label, date.toDate());
};

const triggerReminder = async (context, label, subscription, daysBefore) => {
  return await context.run(label, async () => {
    console.log(`Triggering scheduled reminder for ${label}`);
    
    const type = daysBefore === 1 ? '1day' : `${daysBefore}days`;

    await sendReminderEmail({
      to: subscription.user.email,
      type:type,
      subscription,
    });

    console.log(`✅📧 Scheduled reminder email sent on ${daysBefore} days to ${subscription.user.email} for subscription: ${subscription.name}`);

    return { status: "Reminder sent", label };
  });
};
