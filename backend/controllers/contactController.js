const { transporter } = require('../middleware/emailConfig');
const Feedback = require('../models/Feedback');

exports.sendContactEmail = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Save to database
    const feedback = await Feedback.create({
      name,
      email,
      message,
      status: 'pending'
    });

    // Send email notification to admin
    await transporter.sendMail({
      from: email,
      to: 'daniyalkhawar41@gmail.com',
      subject: `Contact Form Submission from ${name}`,
      text: message,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message}</p>`
    });

    res.status(200).json({ 
      success: 'Message sent successfully!',
      feedbackId: feedback._id
    });
  } catch (err) {
    console.error('Contact form error:', err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
};
