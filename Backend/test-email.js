// Backend/test-email.js
// Script pour tester rapidement l'envoi d'emails

const { sendInvitationEmail, testEmailConnection } = require('./services/emailService');

const testEmail = async () => {
  console.log('🧪 Test du système d\'email...\n');

  try {
    // Test de connexion
    console.log('1. Test de connexion Gmail...');
    const isConnected = await testEmailConnection();

    if (!isConnected) {
      console.error('❌ Échec de la connexion');
      return;
    }

    console.log('✅ Connexion Gmail réussie\n');

    // Test d'envoi d'email
    console.log('2. Test d\'envoi d\'email d\'invitation...');

    const testData = {
      email: 'kanmegnea@gmail.com', // Envoi vers la même adresse pour test
      organizationName: 'TransparAI Test Org v2',
      inviterName: 'Admin Test',
      role: 'member',
      customMessage: 'Nouveau test avec lien fonctionnel ! Cliquez sur le bouton ou le lien direct.',
      invitationToken: `test-token-v2-${Date.now()}`,
    };

    const result = await sendInvitationEmail(testData);

    console.log('✅ Email envoyé avec succès !');
    console.log('📧 Message ID:', result.messageId);
    console.log('📮 Destinataire:', result.email);

    console.log('\n🎉 Test terminé avec succès !');
    console.log('📬 Vérifiez votre boîte email kanmegnea@gmail.com');
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message);
  }

  process.exit(0);
};

testEmail();
