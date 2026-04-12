const { transporter } = require('./emailConfig');
const { verificationEmailTemplate, welcomeEmailTemplate, satelliteAlertEmailTemplate } = require('./emailTemplates');

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

const sendBroadcastEmail = async (email, name, subject, message) => {
  try {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; color: white; }
          .content { background: #f9f9f9; padding: 30px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 FasalGuard</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <div style="white-space: pre-wrap;">${message}</div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} FasalGuard. All rights reserved.</p>
            <p>This is an automated message from FasalGuard Admin.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const response = await transporter.sendMail({
      from: `"FasalGuard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subject,
      text: message,
      html: html
    });
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.log('Broadcast email error:', error);
    return { success: false, error: error.message };
  }
};

const sendSatelliteAlertEmail = async (email, payload) => {
  try {
    const subject = payload?.subject || 'FasalGuard Field Alert';
    const html = satelliteAlertEmailTemplate(payload);
    const response = await transporter.sendMail({
      from: `"FasalGuard" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      text: payload?.summary || 'Field alert generated.',
      html,
    });
    return { success: true, messageId: response.messageId };
  } catch (error) {
    console.log('Satellite alert email error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendBroadcastEmail,
  sendSatelliteAlertEmail
};
