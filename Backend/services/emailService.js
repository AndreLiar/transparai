// Backend/services/emailService.js
const nodemailer = require('nodemailer');

// Configuration Gmail avec mot de passe d'application
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kanmegnea@gmail.com',
    pass: 'hyyyxnxlpyafwfjj', // Mot de passe d'application Gmail
  },
});

// Template HTML pour l'invitation
const getInvitationEmailTemplate = (organizationName, inviterName, role, customMessage, invitationLink) => {
  const roleNames = {
    admin: '⚡ Administrateur',
    manager: '👔 Manager',
    member: '👤 Membre',
  };

  const roleDescriptions = {
    admin: 'Accès complet à toutes les fonctionnalités et paramètres de l\'organisation',
    manager: 'Peut inviter des utilisateurs et accéder aux rapports d\'équipe',
    member: 'Accès aux fonctionnalités de base pour effectuer des analyses',
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
        .invite-card { background: white; padding: 25px; border-radius: 10px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .role-badge { display: inline-block; background: #dbeafe; color: #1e40af; padding: 5px 15px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .custom-message { background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 15px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 TransparAI</h1>
          <h2>Invitation à rejoindre une organisation</h2>
        </div>
        
        <div class="content">
          <div class="invite-card">
            <h3>🏢 Vous êtes invité(e) à rejoindre "${organizationName}"</h3>
            
            <p><strong>${inviterName}</strong> vous invite à rejoindre son organisation sur TransparAI en tant que :</p>
            
            <div class="role-badge">${roleNames[role]}</div>
            
            <p><em>${roleDescriptions[role]}</em></p>
            
            ${customMessage ? `
              <div class="custom-message">
                <h4>💬 Message personnel :</h4>
                <p>"${customMessage}"</p>
              </div>
            ` : ''}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                🚀 Accepter l'invitation
              </a>
            </div>
            
            <div style="margin: 20px 0; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #3b82f6;">
              <p style="margin: 5px 0; font-size: 14px; color: #1e40af;">
                <strong>🔗 Lien direct :</strong><br>
                <a href="${invitationLink}" style="color: #3b82f6; word-break: break-all;">${invitationLink}</a>
              </p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #6b7280;">
                Si le bouton ne fonctionne pas, copiez-collez ce lien dans votre navigateur
              </p>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px;">
              <h4>✨ Fonctionnalités TransparAI Enterprise :</h4>
              <ul>
                <li>🔍 Analyses IA avancées de documents</li>
                <li>📊 Analyses comparatives multi-documents</li>
                <li>👥 Collaboration en équipe</li>
                <li>📋 Historique et traçabilité complète</li>
                <li>🎨 Interface personnalisée aux couleurs de votre entreprise</li>
                <li>🚀 Support technique dédié</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Cette invitation expire dans 7 jours.</p>
            <p>Si vous ne souhaitez pas rejoindre cette organisation, vous pouvez ignorer cet email.</p>
            <p>© 2024 TransparAI - Analyse intelligente de documents</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Fonction pour envoyer une invitation
const sendInvitationEmail = async ({
  email,
  organizationName,
  inviterName,
  role,
  customMessage,
  invitationToken,
}) => {
  try {
    // Créer le lien d'invitation (pointe vers la page d'acceptation)
    const invitationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/accept-invitation?token=${invitationToken}`;

    // Configuration de l'email
    const mailOptions = {
      from: {
        name: 'TransparAI',
        address: 'kanmegnea@gmail.com',
      },
      to: email,
      subject: `🏢 Invitation à rejoindre "${organizationName}" sur TransparAI`,
      html: getInvitationEmailTemplate(organizationName, inviterName, role, customMessage, invitationLink),
    };

    // Envoyer l'email
    const result = await transporter.sendMail(mailOptions);

    console.log(`✅ Email d'invitation envoyé à ${email}:`, result.messageId);
    return {
      success: true,
      messageId: result.messageId,
      email,
    };
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${email}:`, error);
    throw new Error(`Impossible d'envoyer l'invitation à ${email}: ${error.message}`);
  }
};

// Fonction pour envoyer un email de confirmation à l'inviteur
const sendInvitationConfirmationEmail = async ({
  inviterEmail,
  organizationName,
  invitedEmails,
  totalSent,
}) => {
  try {
    const mailOptions = {
      from: {
        name: 'TransparAI',
        address: 'kanmegnea@gmail.com',
      },
      to: inviterEmail,
      subject: `✅ Invitations envoyées pour "${organizationName}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>✅ Invitations envoyées avec succès</h2>
          <p>Vos invitations pour rejoindre <strong>"${organizationName}"</strong> ont été envoyées à :</p>
          <ul>
            ${invitedEmails.map((email) => `<li>📧 ${email}</li>`).join('')}
          </ul>
          <p><strong>Total : ${totalSent} invitation(s) envoyée(s)</strong></p>
          <p>Les destinataires recevront un email avec un lien pour rejoindre votre organisation.</p>
          <p>Les invitations expirent dans 7 jours.</p>
          <hr>
          <p style="color: #6b7280; font-size: 14px;">TransparAI - Gestion d'organisation</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de confirmation envoyé à ${inviterEmail}`);
  } catch (error) {
    console.error(`❌ Erreur envoi confirmation à ${inviterEmail}:`, error);
    // Ne pas faire échouer le processus si la confirmation échoue
  }
};

// Test de la configuration email
const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('✅ Configuration email Gmail validée');
    return true;
  } catch (error) {
    console.error('❌ Erreur configuration email:', error);
    return false;
  }
};

module.exports = {
  sendInvitationEmail,
  sendInvitationConfirmationEmail,
  testEmailConnection,
};
