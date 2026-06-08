const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendRegulatorCredentials(
  email,
  regulatorName,
  regulatorId,
  temporaryPassword
) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Agri ZKP - Regulator Account Approved",
    html: `
      <h2>Congratulations ${regulatorName}</h2>

      <p>Your regulator application has been approved.</p>

      <h3>Login Credentials</h3>

      <p><b>Regulator ID:</b> ${regulatorId}</p>
      <p><b>Temporary Password:</b> ${temporaryPassword}</p>

      <p>Please login and change your password immediately.</p>

      <br/>

      <p>Agri ZKP Privacy Layer</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  sendRegulatorCredentials,
};