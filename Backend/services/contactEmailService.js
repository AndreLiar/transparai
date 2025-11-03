// Backend/services/contactEmailService.js
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Create Gmail transporter with App Password
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ktaylconsult@gmail.com',
      pass: 'kqmhmgpcjsmqkntr' // App Password for TransparAI
    },
    secure: true,
    port: 465,
  });
};

// Send contact form email
const sendContactEmail = async (formData) => {
  const { name, email, subject, message } = formData;
  
  try {
    const transporter = createTransporter();
    
    // Email to you (the business owner)
    const businessEmailOptions = {
      from: 'ktaylconsult@gmail.com',
      to: 'ktaylconsult@gmail.com',
      subject: `[TransparAI Contact] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #005CFF; border-bottom: 2px solid #005CFF; padding-bottom: 10px;">
            📬 Nouveau message de contact - TransparAI
          </h2>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0A1E3F; margin-top: 0;">Informations du contact</h3>
            <p><strong>👤 Nom :</strong> ${name}</p>
            <p><strong>📧 Email :</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>📌 Sujet :</strong> ${subject}</p>
          </div>
          
          <div style="background: #fff; padding: 20px; border-left: 4px solid #005CFF; margin: 20px 0;">
            <h3 style="color: #0A1E3F; margin-top: 0;">💬 Message</h3>
            <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #1e40af;">
            <p style="margin: 0;"><strong>🔗 Répondre :</strong> Vous pouvez répondre directement à ${email}</p>
            <p style="margin: 5px 0 0 0;"><strong>🕐 Reçu le :</strong> ${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      `,
      replyTo: email // This allows you to reply directly to the sender
    };
    
    // Auto-reply to the user
    const userAutoReplyOptions = {
      from: 'ktaylconsult@gmail.com',
      to: email,
      subject: '✅ Message reçu - TransparAI Support',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #005CFF; border-bottom: 2px solid #005CFF; padding-bottom: 10px;">
            ✅ Votre message a été reçu
          </h2>
          
          <p>Bonjour <strong>${name}</strong>,</p>
          
          <p>Merci de nous avoir contactés ! Nous avons bien reçu votre message concernant : <strong>"${subject}"</strong></p>
          
          <div style="background: #f0fdf4; border: 1px solid #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #166534; margin-top: 0;">📋 Récapitulatif de votre demande</h3>
            <p><strong>Sujet :</strong> ${subject}</p>
            <p><strong>Message :</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 3px solid #22c55e;">
              <p style="margin: 0; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="background: #fffbeb; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #92400e; margin-top: 0;">⏰ Temps de réponse</h3>
            <p style="margin: 0; color: #a16207;">Nous nous engageons à vous répondre dans les <strong>24-48 heures</strong>. Pour les questions urgentes, n'hésitez pas à nous relancer.</p>
          </div>
          
          <p>En attendant, vous pouvez :</p>
          <ul>
            <li>🚀 <a href="https://transparai.vercel.app/signup" style="color: #005CFF;">Créer un compte gratuit</a> et tester notre service</li>
            <li>📚 Consulter notre <a href="https://transparai.vercel.app/privacy-policy" style="color: #005CFF;">documentation</a></li>
            <li>💬 Rejoindre notre communauté d'utilisateurs</li>
          </ul>
          
          <div style="border-top: 2px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">
              <strong>TransparAI</strong> - Votre assistant IA pour l'analyse de conditions générales<br/>
              <a href="mailto:ktaylconsult@gmail.com" style="color: #005CFF;">ktaylconsult@gmail.com</a>
            </p>
          </div>
        </div>
      `
    };
    
    // Send both emails
    await Promise.all([
      transporter.sendMail(businessEmailOptions),
      transporter.sendMail(userAutoReplyOptions)
    ]);
    
    logger.info('Contact form emails sent successfully', {
      to: email,
      subject: subject,
      from: name
    });
    
    return {
      success: true,
      message: 'Emails sent successfully'
    };
    
  } catch (error) {
    logger.error('Failed to send contact form email', {
      error: error.message,
      stack: error.stack,
      formData: { name, email, subject }
    });
    
    throw new Error('Failed to send email');
  }
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Gmail SMTP connection verified successfully');
    return { success: true, message: 'Email connection verified' };
  } catch (error) {
    logger.error('Gmail SMTP connection failed', { error: error.message });
    throw new Error('Email connection failed');
  }
};

module.exports = {
  sendContactEmail,
  testEmailConnection
};