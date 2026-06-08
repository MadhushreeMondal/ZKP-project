const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true only for port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error("EMAIL CONFIG ERROR:", error);
  } else {
    console.log("EMAIL SERVER READY");
  }
});

async function sendRegulatorCredentials(
  email,
  regulatorName,
  regulatorId,
  temporaryPassword
) {
  try {
    console.log("Sending email to:", email);

    const mailOptions = {
      from: `"Agri ZKP Privacy Layer" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Agri ZKP - Regulator Account Approved",
      html: `
        <h2>Congratulations ${regulatorName}</h2>

        <p>Your regulator application has been approved.</p>

        <h3>Login Credentials</h3>

        <p><strong>Regulator ID:</strong> ${regulatorId}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>

        <p>Please login and change your password immediately.</p>

        <br>

        <p>Regards,</p>
        <p><strong>Agri ZKP Privacy Layer Team</strong></p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("EMAIL SENT SUCCESSFULLY");
    console.log("Message ID:", info.messageId);

    return info;
  } catch (error) {
    console.error("EMAIL SEND ERROR:", error);
    throw error;
  }
}

module.exports = {
  sendRegulatorCredentials,
};