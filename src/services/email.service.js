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

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Successful";
  const text = `Hello ${name},

Your transaction has been successfully processed by VaultRise Bank.

Transaction Details:
Amount: ${amount}
Transaction ID: ${transactionId}
Date: ${date}
Status: Successful

If you did not authorize this transaction, please contact VaultRise Bank Customer Support immediately.

Thank you for banking with VaultRise Bank.

Best regards,
VaultRise Bank
Customer Support Team`;

  const html = `
<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;">
    <p>Hello ${name},</p>

    <p>
        Your transaction has been successfully processed by
        <strong>VaultRise Bank</strong>.
    </p>

    <div style="background: #f7f7f7; padding: 20px; border-radius: 6px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Transaction Details</h3>

        <p style="margin: 8px 0;">
            <strong>Amount:</strong> ${amount}
        </p>

        <p style="margin: 8px 0;">
            <strong>Transaction ID:</strong> ${transactionId}
        </p>

        <p style="margin: 8px 0;">
            <strong>Date:</strong> ${date}
        </p>

        <p style="margin: 8px 0;">
            <strong>Status:</strong>
            <span style="font-weight: bold;">Successful</span>
        </p>
    </div>

    <p>
        If you did not authorize this transaction, please contact
        <strong>VaultRise Bank Customer Support</strong> immediately.
    </p>

    <p>
        Thank you for banking with VaultRise Bank.
    </p>

    <p>
        Best regards,<br>
        <strong>VaultRise Bank</strong><br>
        Customer Support Team
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">

    <p style="font-size: 12px; color: #777;">
        This is an automated transaction notification. Please do not reply
        directly to this message.
    </p>
</div>
`;
  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed";
  const text = `Hello ${name}, We were unable to complete your transaction with VaultRise Bank. Transaction Details: Amount: ${amount} Recipient Account: ${toAccount} Status: Failed No funds were transferred as part of this transaction. If you did not initiate this transaction or believe this message was sent in error, please contact VaultRise Bank Customer Support immediately. Best regards, VaultRise Bank Customer Support Team`;
  const html = ` <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: auto;"> <p>Hello ${name},</p> <p> We were unable to complete your transaction with <strong>VaultRise Bank</strong>. </p> <div style="background: #f7f7f7; padding: 20px; border-radius: 6px; margin: 20px 0;"> <h3 style="margin-top: 0;">Transaction Details</h3> <p style="margin: 8px 0;"> <strong>Amount:</strong> ${amount} </p> <p style="margin: 8px 0;"> <strong>Recipient Account:</strong> ${toAccount} </p> <p style="margin: 8px 0;"> <strong>Status:</strong> Failed </p> </div> <p> No funds were transferred as part of this transaction. </p> <p> If you did not initiate this transaction or believe this message was sent in error, please contact <strong>VaultRise Bank Customer Support</strong> immediately. </p> <p> Best regards,<br> <strong>VaultRise Bank</strong><br> Customer Support Team </p> <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;"> <p style="font-size: 12px; color: #777;"> This is an automated transaction notification. Please do not reply directly to this message. </p> </div> `;
  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};
