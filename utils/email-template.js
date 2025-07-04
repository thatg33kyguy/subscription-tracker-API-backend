// Email templates for subscription renewal reminders with full HTML and styling

function getRenewalEmailTemplate({
  userName,
  subscriptionName,
  renewalDate,
  price,
  daysLeft,
  paymentMethod,
  settingsLink = '#',
  supportLink = '#'
}) {
  const formattedDate = new Date(renewalDate).toLocaleDateString();
  let subject = '';
  let message = '';
  let highlight = '';

  switch (daysLeft) {
    case 7:
      subject = `⏰ 1 Week Left: ${subscriptionName} Subscription Renewal Reminder`;
      highlight = '7 days';
      message = `This is a friendly reminder that your <b>${subscriptionName}</b> subscription will renew in <b>7 days</b> on <b>${formattedDate}</b>.`;
      break;
    case 5:
      subject = `⏰ 5 Days Left: ${subscriptionName} Subscription Renewal Reminder`;
      highlight = '5 days';
      message = `Just a quick reminder: your <b>${subscriptionName}</b> subscription will renew in <b>5 days</b> on <b>${formattedDate}</b>.`;
      break;
    case 3:
      subject = `⏰ 3 Days Left: ${subscriptionName} Subscription Renewal Reminder`;
      highlight = '3 days';
      message = `Your <b>${subscriptionName}</b> subscription will renew in <b>3 days</b> on <b>${formattedDate}</b>.`;
      break;
    case 1:
      subject = `⏰ Tomorrow: ${subscriptionName} Subscription Will Renew`;
      highlight = 'tomorrow';
      message = `This is your last reminder: your <b>${subscriptionName}</b> subscription will renew <b>tomorrow</b> (${formattedDate}).`;
      break;
    default:
      subject = `${subscriptionName} Subscription Renewal Reminder`;
      highlight = formattedDate;
      message = `Your <b>${subscriptionName}</b> subscription will renew on <b>${formattedDate}</b>.`;
  }

  const html = `
  <div style="background:#f6f8fa;padding:32px 0;min-height:100vh;">
    <table style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.07);font-family:'Segoe UI',Arial,sans-serif;overflow:hidden;">
      <tr>
        <td style="background:#4f8cff;color:#fff;padding:24px 32px 16px 32px;text-align:center;">
          <h2 style="margin:0;font-size:1.5rem;letter-spacing:1px;">Subscription Reminder</h2>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 16px 32px;">
          <p style="font-size:1.1rem;margin:0 0 16px 0;">Hi <b>${userName}</b>,</p>
          <p style="font-size:1.05rem;margin:0 0 20px 0;">${message}</p>
          <div style="background:#f0f4ff;padding:16px 20px;border-radius:8px;margin-bottom:20px;">
            <table style="width:100%;font-size:1rem;">
              <tr><td style="padding:4px 0;color:#555;">Subscription:</td><td style="padding:4px 0;"><b>${subscriptionName}</b></td></tr>
              <tr><td style="padding:4px 0;color:#555;">Renewal Date:</td><td style="padding:4px 0;"><b>${formattedDate}</b></td></tr>
              <tr><td style="padding:4px 0;color:#555;">Amount:</td><td style="padding:4px 0;"><b>${price}</b></td></tr>
              <tr><td style="padding:4px 0;color:#555;">Payment Method:</td><td style="padding:4px 0;"><b>${paymentMethod}</b></td></tr>
              <tr><td style="padding:4px 0;color:#555;">Time Left:</td><td style="padding:4px 0;"><span style="color:#4f8cff;font-weight:bold;">${highlight}</span></td></tr>
            </table>
          </div>
          <div style="margin-bottom:18px;">
            <a href="${settingsLink}" style="display:inline-block;background:#4f8cff;color:#fff;text-decoration:none;padding:10px 22px;border-radius:6px;font-weight:500;margin-right:10px;">Access Settings</a>
            <a href="${supportLink}" style="display:inline-block;background:#e0e7ff;color:#4f8cff;text-decoration:none;padding:10px 22px;border-radius:6px;font-weight:500;border:1px solid #4f8cff;">Contact Support</a>
          </div>
          <p style="font-size:1rem;color:#444;">If you wish to make changes, update your payment method, or cancel, please do so before the renewal date.</p>
          <p style="font-size:1rem;color:#444;">Thank you for using our service!</p>
        </td>
      </tr>
      <tr>
        <td style="background:#f6f8fa;padding:16px 32px;text-align:center;font-size:0.95rem;color:#888;">
          &copy; ${new Date().getFullYear()} Subscription Tracker
        </td>
      </tr>
    </table>
  </div>
  `;

  return {
    subject,
    html
  };
}

export default getRenewalEmailTemplate;
