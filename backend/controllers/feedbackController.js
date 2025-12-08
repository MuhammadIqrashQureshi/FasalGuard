const Feedback = require('../models/Feedback');
const { transporter } = require('../middleware/emailConfig');

// Get all feedback queries (for admin)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback'
    });
  }
};

// Get single feedback by ID
exports.getFeedbackById = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('repliedBy', 'name email');
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve feedback'
    });
  }
};

// Reply to feedback
exports.replyToFeedback = async (req, res) => {
  try {
    const { reply } = req.body;
    const feedbackId = req.params.id;
    
    if (!reply || reply.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }
    
    // Find the feedback
    const feedback = await Feedback.findById(feedbackId);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    // Send email to user FIRST
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'FasalGuard <noreply@fasalguard.com>',
      to: feedback.email,
      subject: 'Response to Your Query - FasalGuard',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .original-message { background: #fff; padding: 15px; margin: 20px 0; border-left: 4px solid #22c55e; border-radius: 5px; }
            .reply-message { background: #e8f5e9; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            h1 { margin: 0; font-size: 24px; }
            h3 { color: #16a34a; margin-top: 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌾 FasalGuard Support</h1>
            </div>
            <div class="content">
              <p>Dear ${feedback.name},</p>
              <p>Thank you for reaching out to FasalGuard. We've reviewed your query and are pleased to provide you with a response.</p>
              
              <div class="original-message">
                <h3>Your Query:</h3>
                <p>${feedback.message}</p>
                <small style="color: #666;">Submitted on: ${new Date(feedback.createdAt).toLocaleString()}</small>
              </div>
              
              <div class="reply-message">
                <h3>Our Response:</h3>
                <p>${reply.replace(/\n/g, '<br>')}</p>
              </div>
              
              <p>If you have any further questions, please don't hesitate to contact us again.</p>
              
              <p>Best regards,<br>
              <strong>The FasalGuard Team</strong></p>
              
              <div class="footer">
                <p>This is an automated response from FasalGuard Support System</p>
                <p>© ${new Date().getFullYear()} FasalGuard. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    // Update feedback with reply AFTER successful email
    feedback.reply = reply;
    feedback.repliedAt = new Date();
    feedback.repliedBy = req.user.id; // From auth middleware
    feedback.status = 'done'; // Auto-mark as done when replied
    await feedback.save();
    
    res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Reply to feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
};

// Update feedback status (manually mark as done/pending)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const feedbackId = req.params.id;
    
    if (!status || !['pending', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending or done)'
      });
    }
    
    const feedback = await Feedback.findByIdAndUpdate(
      feedbackId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status'
    });
  }
};

// Delete feedback (optional - for admin cleanup)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete feedback'
    });
  }
};
