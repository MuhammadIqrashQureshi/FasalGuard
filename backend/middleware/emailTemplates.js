const verificationEmailTemplate = (verificationCode) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - FasalGuard</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #4CAF50;
              background: #e8f5e9;
              border: 1px dashed #4CAF50;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email - FasalGuard</div>
          <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up with FasalGuard! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">${verificationCode}</span>
              <p>This code will expire in 24 hours. If you did not create an account, no further action is required.</p>
              <p>If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} FasalGuard. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

const welcomeEmailTemplate = (name) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to FasalGuard</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #4CAF50;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #4CAF50;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #45a049;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to FasalGuard!</div>
          <div class="content">
              <p class="welcome-message">Hello ${name},</p>
              <p>We're thrilled to have you join FasalGuard! Your email has been successfully verified, and you're now ready to explore our agricultural monitoring platform.</p>
              <p>Here's how you can get started:</p>
              <ul>
                  <li>Set up your farm profile and monitoring preferences</li>
                  <li>Explore our crop monitoring and disease detection features</li>
                  <li>Connect with our community of farmers and agricultural experts</li>
                  <li>Access real-time weather and soil condition data</li>
              </ul>
              <a href="#" class="button">Get Started with FasalGuard</a>
              <p>If you need any help, don't hesitate to contact our support team. We're here to support you every step of the way.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} FasalGuard. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;

const satelliteAlertEmailTemplate = (payload) => {
    const safe = (value, fallback = 'N/A') => (value ? String(value) : fallback);
    const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
    const metrics = payload?.weatherMetrics || {};
    const cropDelta = payload?.cropDelta || {};
    const irrigation = payload?.irrigation || {};
    const economic = payload?.economic || {};
    const ctas = payload?.ctas || {};
    const pestWatch = Array.isArray(payload?.pestWatch) ? payload.pestWatch : [];

    const taskRows = tasks.length
        ? tasks.map((item) => `<li>${safe(item)}</li>`).join('')
        : '<li>No actions available.</li>';

    const pestRows = pestWatch.length
        ? pestWatch.map((item) => `<li>${safe(item)}</li>`).join('')
        : '<li>No high-risk pests detected.</li>';

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>FasalGuard Alert</title>
            <style>
                body { margin: 0; padding: 0; background: #f4f6f8; font-family: Arial, sans-serif; color: #111827; }
                .container { max-width: 640px; margin: 24px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; }
                .header { background: #b91c1c; color: #ffffff; padding: 18px 22px; }
                .header h1 { margin: 0; font-size: 20px; letter-spacing: 0.02em; }
                .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.9; }
                .content { padding: 20px 22px; }
                .summary { font-size: 15px; font-weight: 600; margin-bottom: 14px; }
                .section { margin-top: 18px; }
                .section h3 { margin: 0 0 8px; font-size: 14px; color: #111827; text-transform: uppercase; letter-spacing: 0.04em; }
                .metric-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
                .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; font-size: 13px; }
                .cta { margin-top: 18px; display: flex; gap: 10px; flex-wrap: wrap; }
                .cta a { display: inline-block; padding: 10px 14px; border-radius: 8px; background: #1d4ed8; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; }
                .cta a.secondary { background: #0f766e; }
                .footer { padding: 16px 22px; background: #f9fafb; font-size: 12px; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${safe(payload?.subject, 'Field Alert')}</h1>
                    <p>${safe(payload?.city, 'Unknown location')} | ${safe(payload?.date, 'Unknown date')}</p>
                </div>
                <div class="content">
                    <div class="summary">${safe(payload?.summary, 'Field condition alert detected.')}</div>

                    <div class="section">
                        <h3>Top Actions (Next 48h)</h3>
                        <ol>${taskRows}</ol>
                    </div>

                    <div class="section">
                        <h3>Pest &amp; Disease Watch</h3>
                        <ol>${pestRows}</ol>
                    </div>

                    <div class="section">
                        <h3>Weather Risk Metrics</h3>
                        <div class="metric-grid">
                            <div class="metric-card">Max Temp: ${safe(metrics.maxTemp)}</div>
                            <div class="metric-card">Expected Rain: ${safe(metrics.expectedRain)}</div>
                            <div class="metric-card">Dry Days: ${safe(metrics.dryDays)}</div>
                            <div class="metric-card">Risk Window: ${safe(metrics.window)}</div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Crop Recommendation</h3>
                        <div class="metric-grid">
                            <div class="metric-card">Best Crop: ${safe(cropDelta.bestCrop)}</div>
                            <div class="metric-card">Confidence: ${safe(cropDelta.confidence)}</div>
                            <div class="metric-card">Yield Impact: ${safe(cropDelta.yieldImpact)}</div>
                            <div class="metric-card">Reason: ${safe(cropDelta.reason)}</div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Irrigation Instruction</h3>
                        <div class="metric-grid">
                            <div class="metric-card">Next Irrigation: ${safe(irrigation.nextDate)}</div>
                            <div class="metric-card">Depth/Volume: ${safe(irrigation.depth)}</div>
                            <div class="metric-card">Window: ${safe(irrigation.window)}</div>
                            <div class="metric-card">Note: ${safe(irrigation.note)}</div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Economic Hint</h3>
                        <div class="metric-grid">
                            <div class="metric-card">PKR Impact: ${safe(economic.range)}</div>
                            <div class="metric-card">Loss Risk: ${safe(economic.lossRisk)}</div>
                        </div>
                    </div>

                    <div class="cta">
                        ${ctas.dashboardUrl ? `<a href="${ctas.dashboardUrl}">Open Dashboard</a>` : ''}
                        ${ctas.reportUrl ? `<a class="secondary" href="${ctas.reportUrl}">Open Report</a>` : ''}
                    </div>
                </div>

                <div class="footer">
                    <div>Generated at: ${safe(payload?.generatedAt)}</div>
                    <div>Reason: ${safe(payload?.reason)}</div>
                    <div>${safe(payload?.unsubscribeText, 'You are receiving this alert because you ran a satellite analysis.')}</div>
                </div>
            </div>
        </body>
        </html>
    `;
};

module.exports = {
  verificationEmailTemplate,
    welcomeEmailTemplate,
    satelliteAlertEmailTemplate
};
