const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendRegulatorCredentials(
  email,
  regulatorName,
  regulatorId,
  temporaryPassword
) {
  try {
    const response = await resend.emails.send({
      from: "onboarding@resend.dev",
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

        <p>Agri ZKP Privacy Layer Team</p>
      `,
    });

    console.log("EMAIL SENT:", response);
    return response;
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw error;
  }
}

module.exports = {
  sendRegulatorCredentials,
};