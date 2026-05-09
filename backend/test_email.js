// Quick email test script — run with: node test_email.js
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('\n📧 Testing Resend HTTP API...');
  
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
  
  console.log('RESEND_API_KEY:', apiKey ? `SET (length: ${apiKey.length})` : '❌ NOT SET');
  console.log('EMAIL_FROM:', fromEmail);

  if (!apiKey) {
    console.error('\n❌ Missing RESEND_API_KEY in .env.local');
    process.exit(1);
  }

  // To send to yourself, we need to know your email address. 
  // If you are using onboarding@resend.dev, it MUST match your registered Resend email.
  const toEmail = process.argv[2];
  if (!toEmail) {
    console.error('\n⚠️ Please provide your email address as an argument:');
    console.error('   node test_email.js you@example.com\n');
    console.error('Note: If using onboarding@resend.dev, this must be the email you used to sign up for Resend.');
    process.exit(1);
  }

  console.log(`\n⏳ Sending test email to ${toEmail} ...`);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Connectify Test <${fromEmail}>`,
        to: [toEmail],
        subject: '✅ Connectify Email Test — HTTP API Working!',
        html: `<div style="font-family:Arial;padding:20px;background:#1a1a2e;color:#fff;border-radius:10px;">
          <h2 style="color:#a78bfa;">✦ Connectify Email Test</h2>
          <p>If you see this — your new Resend HTTP API is working correctly! 🎉</p>
          <p style="color:#888;font-size:12px;">Sent at: ${new Date().toISOString()}</p>
        </div>`,
        text: 'Connectify email test successful via Resend API!',
      })
    });
    
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(`Status ${response.status}: ${JSON.stringify(errData)}`);
    }
    
    const responseData = await response.json();
    
    console.log('\n✅ Email sent successfully via Resend API!');
    console.log('Response ID:', responseData.id);
    console.log('\n👉 Check your inbox (and Spam folder) for the test email.');
  } catch (err) {
    console.error('\n❌ Failed to send email!');
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testEmail();
