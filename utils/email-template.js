// A more modern and clean email template with emojis and improved styling.

function getRenewalEmailTemplate({
  userName,
  subscriptionName,
  renewalDate, // Expecting 'MMMM D, YYYY' format from send-email.js
  price,
  daysLeft,
  paymentMethod,
  settingsLink = '#',
}) {
  const formattedDate = renewalDate;
  let subject = '';
  let message = '';
  let highlight = '';

  switch (daysLeft) {
    case 7:
      subject = `🗓️ 1 Week Left: Your ${subscriptionName} subscription is renewing soon!`;
      highlight = 'Renewing in 7 days';
      message = `This is a friendly heads-up that your <b>${subscriptionName}</b> subscription is scheduled to renew on <b>${formattedDate}</b>.`;
      break;
    case 5:
      subject = `👀 5 Days Left: Your ${subscriptionName} subscription renewal`;
      highlight = 'Renewing in 5 days';
      message = `Just a quick reminder, your <b>${subscriptionName}</b> subscription will renew on <b>${formattedDate}</b>.`;
      break;
    case 3:
      subject = `⚠️ Action Required: ${subscriptionName} renews in 3 days`;
      highlight = 'Renewing in 3 days';
      message = `Your <b>${subscriptionName}</b> subscription is renewing soon! The payment will be processed on <b>${formattedDate}</b>.`;
      break;
    case 1:
      subject = `❗ Final Reminder: ${subscriptionName} renews tomorrow!`;
      highlight = 'Renews Tomorrow!';
      message = `This is your final reminder! Your <b>${subscriptionName}</b> subscription will renew <b>tomorrow, ${formattedDate}</b>.`;
      break;
    default: // This will be used for the confirmation email when daysLeft is 0
      subject = `✅ Success! Your ${subscriptionName} subscription is confirmed.`;
      highlight = '✅ Confirmed';
      message = `We've successfully registered your <b>${subscriptionName}</b> subscription. Your first renewal will be on <b>${formattedDate}</b>. We'll remind you beforehand!`;
  }

  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body { margin: 0; background-color: #f7f8fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
      .container { max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e8e8e8; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 25px rgba(0,0,0,0.07); }
      .header { background-color: #4A90E2; color: #ffffff; padding: 40px 20px; text-align: center; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
      .content { padding: 35px 40px; color: #333333; line-height: 1.7; }
      .content p { margin: 0 0 25px; font-size: 16px; }
      .details-box { background-color: #f7f8fa; border-radius: 8px; padding: 20px; margin-bottom: 25px; }
      .details-table { width: 100%; border-collapse: collapse; }
      .details-table td { padding: 10px 0; font-size: 16px; border-bottom: 1px solid #eeeeee; }
      .details-table tr:last-child td { border-bottom: none; }
      .details-table td:first-child { color: #555555; width: 150px; }
      .highlight { color: #4A90E2; font-weight: bold; font-size: 16px; }
      .cta-button { display: inline-block; background-color: #4A90E2; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin-top: 15px; font-size: 16px; }
      .footer { background-color: #f7f8fa; padding: 25px; text-align: center; font-size: 13px; color: #999999; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Subscription Alert 🔔</h1>
      </div>
      <div class="content">
        <p>Hi <b>${userName}</b>,</p>
        <p>${message}</p>
        <div class="details-box">
          <table class="details-table">
            <tr><td>Subscription:</td><td><b>${subscriptionName}</b></td></tr>
            <tr><td>Renewal Date:</td><td><b>${formattedDate}</b></td></tr>
            <tr><td>Amount:</td><td><b>${price}</b></td></tr>
            <tr><td>Payment Method:</td><td><b>${paymentMethod}</b></td></tr>
            <tr><td>Status:</td><td><span class="highlight">${highlight}</span></td></tr>
          </table>
        </div>
        <a href="${settingsLink}" class="cta-button">Manage Subscriptions</a>
        <p style="margin-top: 30px; font-size: 14px; color: #777;">Need to make a change? You can update your details anytime before the renewal date.</p>
      </div>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} SubTracker. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
  `;

  return { subject, html };
}

export default getRenewalEmailTemplate;
