import { Resend } from 'resend';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export async function sendContactNotification(data: any) {
  try {
    const result = await resend.emails.send({
      from: 'LbisTech <noreply@lbistech.com>',
      to: ['team@lbistech.com'],
      subject: 'New Contact Form Submission - LbisTech',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1E293B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">LbisTech</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">New Contact Form Submission</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1E293B; margin-top: 0;">Dear LbisTech Team,</h2>
            <p style="color: #64748B; margin-bottom: 25px;">You have received a new contact form submission:</p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B; width: 140px;">Name:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.first_name} ${data.last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Email:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Phone:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Course Interest:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.course_interest}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Submitted on:</td>
                  <td style="padding: 8px 0; color: #475569;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1E293B; margin-bottom: 10px;">Message:</h3>
              <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #FF6B6B; border-radius: 4px;">
                <p style="margin: 0; color: #475569; line-height: 1.6;">${data.message}</p>
              </div>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">⚡ Please follow up promptly to maintain our excellent customer service standards.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748B; font-size: 14px;">
            <p>Best regards,<br>LbisTech System</p>
          </div>
        </div>
      `
    });
    return result;
  } catch (error) {
    console.error('Error sending contact notification:', error);
    throw error;
  }
}

export async function sendEnrollmentNotification(data: any) {
  try {
    const result = await resend.emails.send({
      from: 'LbisTech <noreply@lbistech.com>',
      to: ['team@lbistech.com'],
      subject: `New Course Enrollment - ${data.course_id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1E293B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">LbisTech</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">New Course Enrollment</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1E293B; margin-top: 0;">Dear LbisTech Team,</h2>
            <p style="color: #64748B; margin-bottom: 25px;">New enrollment for <strong style="color: #FF6B6B;">${data.course_id}</strong>:</p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #1E293B; margin-top: 0; margin-bottom: 15px;">Student Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B; width: 160px;">Name:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.first_name} ${data.last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Email:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Phone:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.phone}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Experience Level:</td>
                  <td style="padding: 8px 0; color: #475569; text-transform: capitalize;">${data.experience_level}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Course Type:</td>
                  <td style="padding: 8px 0; color: #475569;">${data.is_free ? 'Free' : 'Paid'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #1E293B;">Submitted on:</td>
                  <td style="padding: 8px 0; color: #475569;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="margin-bottom: 25px;">
              <h3 style="color: #1E293B; margin-bottom: 10px;">Learning Goals:</h3>
              <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #FF6B6B; border-radius: 4px;">
                <p style="margin: 0; color: #475569; line-height: 1.6;">${data.learning_goals}</p>
              </div>
            </div>
            
            <div style="background-color: #dcfce7; padding: 15px; border-radius: 6px; border-left: 4px solid #16a34a;">
              <p style="margin: 0; color: #166534; font-weight: 500;">🎯 Please process this enrollment and send course details to the student.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748B; font-size: 14px;">
            <p>Best regards,<br>LbisTech System</p>
          </div>
        </div>
      `
    });
    return result;
  } catch (error) {
    console.error('Error sending enrollment notification:', error);
    throw error;
  }
}

export async function sendEnrollmentConfirmation(data: any) {
  try {
    const result = await resend.emails.send({
      from: 'LbisTech <noreply@lbistech.com>',
      to: [data.email],
      subject: 'Course Enrollment Confirmation - LbisTech',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1E293B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">LbisTech</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Course Enrollment Confirmation</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1E293B; margin-top: 0;">Welcome to LbisTech!</h2>
            <p style="color: #64748B; font-size: 16px;">Dear ${data.first_name},</p>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0; color: #166534; font-weight: 500;">🎉 Thank you for enrolling in our <strong>${data.course_id}</strong> course!</p>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              We're excited to have you join our learning community! You've taken an important step towards advancing your career in technology.
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1E293B; margin-top: 0; margin-bottom: 15px;">What happens next?</h3>
              <ul style="color: #475569; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our team will contact you within 24 hours with course details</li>
                <li style="margin-bottom: 8px;">You'll receive access to course materials and schedule</li>
                <li style="margin-bottom: 8px;">We'll provide you with pre-course preparation materials</li>
                <li style="margin-bottom: 8px;">You'll be added to our student WhatsApp community</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">📞 If you have any immediate questions, feel free to contact us!</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #1E293B; font-weight: 500; margin-bottom: 10px;">Contact Information:</p>
              <p style="color: #475569; margin: 5px 0;">📧 Email: team@lbistech.com</p>
              <p style="color: #475569; margin: 5px 0;">📱 Phone: +92 03 111 088 881</p>
              <p style="color: #475569; margin: 5px 0;">📍 Location: Lahore, Pakistan</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748B; font-size: 14px;">
            <p>Best regards,<br><strong>The LbisTech Team</strong></p>
            <p style="margin-top: 15px; font-size: 12px;">Pakistan's Leading AWS & DevOps Training Provider</p>
          </div>
        </div>
      `
    });
    return result;
  } catch (error) {
    console.error('Error sending enrollment confirmation:', error);
    throw error;
  }
}

export async function sendContactConfirmation(data: any) {
  try {
    const result = await resend.emails.send({
      from: 'LbisTech <noreply@lbistech.com>',
      to: [data.email],
      subject: 'Thank you for contacting LbisTech',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
          <div style="background-color: #1E293B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">LbisTech</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Thank you for reaching out!</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1E293B; margin-top: 0;">Hello ${data.first_name}!</h2>
            
            <div style="background-color: #dcfce7; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #16a34a;">
              <p style="margin: 0; color: #166534; font-weight: 500;">✅ We've received your message successfully!</p>
            </div>
            
            <p style="color: #475569; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your interest in <strong>${data.course_interest}</strong>. We appreciate you taking the time to contact us.
            </p>
            
            <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h3 style="color: #1E293B; margin-top: 0; margin-bottom: 15px;">What's next?</h3>
              <ul style="color: #475569; line-height: 1.6; margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Our expert team will review your inquiry</li>
                <li style="margin-bottom: 8px;">We'll respond within 24 hours with detailed information</li>
                <li style="margin-bottom: 8px;">You'll receive personalized course recommendations</li>
                <li style="margin-bottom: 8px;">We'll schedule a free consultation call if needed</li>
              </ul>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 20px 0;">
              <p style="margin: 0; color: #92400e; font-weight: 500;">💡 In the meantime, check out our free resources and webinars on our website!</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #1E293B; font-weight: 500; margin-bottom: 10px;">Contact Information:</p>
              <p style="color: #475569; margin: 5px 0;">📧 Email: team@lbistech.com</p>
              <p style="color: #475569; margin: 5px 0;">📱 Phone: +92 03 111 088 881</p>
              <p style="color: #475569; margin: 5px 0;">📍 Location: Lahore, Pakistan</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #64748B; font-size: 14px;">
            <p>Best regards,<br><strong>The LbisTech Team</strong></p>
            <p style="margin-top: 15px; font-size: 12px;">Pakistan's Leading AWS & DevOps Training Provider</p>
          </div>
        </div>
      `
    });
    return result;
  } catch (error) {
    console.error('Error sending enrollment confirmation:', error);
    throw error;
  }
}