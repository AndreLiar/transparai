// Backend/test-contact-email.js
const { sendContactEmail, testEmailConnection } = require('./services/contactEmailService');

async function testContactSystem() {
  console.log('🧪 Testing Contact Email System...\n');

  try {
    // Test 1: Email connection
    console.log('1️⃣ Testing Gmail SMTP connection...');
    const connectionTest = await testEmailConnection();
    console.log('✅ Connection test:', connectionTest.message);

    // Test 2: Send test email
    console.log('\n2️⃣ Sending test contact email...');
    const testFormData = {
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Contact Form',
      message: 'This is a test message from the contact form system. If you receive this, the email system is working perfectly! 🎉',
    };

    const emailResult = await sendContactEmail(testFormData);
    console.log('✅ Email test:', emailResult.message);

    console.log('\n🎉 All tests passed! Contact form is ready to use.');
    console.log('\n📧 Check your Gmail (ktaylconsult@gmail.com) for:');
    console.log('   - Business notification email');
    console.log('   - Auto-reply confirmation sent to test@example.com');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testContactSystem();
