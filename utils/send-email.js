import getRenewalEmailTemplate from "./email-template.js";
import dayjs from 'dayjs';
import transporter, { accountEmail } from '../config/nodemailer.js';

export const sendReminderEmail = async ({ to, type, subscription }) => {
    if (!to || !type || !subscription) {
        throw new Error("Email recipient, type, and subscription are required");
    }

    // Map type to daysLeft
    const daysMap = { '7days': 7, '5days': 5, '3days': 3, '1day': 1 };
    const daysLeft = daysMap[type] || 0;

    // Prepare template data
    const template = getRenewalEmailTemplate({
        userName: subscription.user.name || 'User',
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMMM D, YYYY'),
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        daysLeft,
        paymentMethod: subscription.paymentMethod || 'N/A'
    });

    const mailOptions = {
        from: accountEmail,
        to,
        subject: template.subject,
        html: template.html
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.log(error, 'Error sending email');
        throw error;
    }
};