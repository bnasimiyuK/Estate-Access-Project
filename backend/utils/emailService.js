// backend/utils/emailService.js
import nodemailer from "nodemailer";

/**
 * Send an email using Gmail SMTP
 * @param {string|string[]} to - Recipient email or array of emails
 * @param {string} subject - Email subject
 * @param {string} html - HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error("EMAIL_USER or EMAIL_PASS environment variable is missing.");
    }

    // Convert array of emails to comma-separated string
    const recipients = Array.isArray(to) ? to.join(",") : to;

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-character App Password
      },
      logger: true,
      debug: true,
      tls: {
        rejectUnauthorized: false, // allow self-signed certs
      },
    });

    // Mail options
    const mailOptions = {
      from: `"${process.env.ESTATE_EMAIL_SENDER || "Athi Estate Management"}" <${process.env.EMAIL_USER}>`,
      to: recipients,
      subject,
      html,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log(`📩 Email sent successfully to: ${recipients}`);
    console.log(`Message ID: ${info.messageId}`);
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    if (error.response) console.error("Response:", error.response);
    throw error; // propagate error to the caller
  }
};
