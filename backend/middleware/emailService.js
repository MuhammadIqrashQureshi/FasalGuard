const { transporter } = require('./emailConfig');
const { verificationEmailTemplate, welcomeEmailTemplate } = require('./emailTemplates');

const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const response = await transporter.sendMail({
      from: `"FasalGuard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your Email - FasalGuard",
      text: "Verify your Email - FasalGuard",
      html: verificationEmailTemplate(verificationCode)
    });
    console.log('Verification email sent successfully:', response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.log('Email error:', error);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await transporter.sendMail({
      from: `"FasalGuard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to FasalGuard!",
      text: "Welcome to FasalGuard!",
      html: welcomeEmailTemplate(name)
    });
    console.log('Welcome email sent successfully:', response.messageId);
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.log('Email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail
};
