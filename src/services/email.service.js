require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error connecting to email server:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Banking-Systemn" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to VaultRise Bank";
  const text = `Hello ${name},

Thank you for registering with VaultRise Bank.

Your account registration has been successfully received. We’re pleased to welcome you to VaultRise Bank and look forward to serving you.

If you did not initiate this registration, please contact our support team immediately.

Best regards,
VaultRise Bank
Customer Support Team`;

  const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;">
    <p>Hello ${name},</p>

    <p>
        Thank you for registering with <strong>VaultRise Bank</strong>.
    </p>

    <p>
        Your account registration has been successfully received.
        We’re pleased to welcome you to VaultRise Bank and look forward
        to serving you.
    </p>

    <p>
        If you did not initiate this registration, please contact our
        support team immediately.
    </p>

    <p>
        Best regards,<br>
        <strong>VaultRise Bank</strong><br>
        Customer Support Team
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">

    <p style="font-size: 12px; color: #777;">
        This is an automated email. Please do not reply directly to this message.
    </p>
</div>
`;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail };
