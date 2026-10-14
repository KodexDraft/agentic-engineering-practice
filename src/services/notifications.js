// TODO: replace with a real email provider (SendGrid, SES, etc.)

function sendEmail({ to, subject }) {
  console.log('[EMAIL] Sending to:', to, '| Subject:', subject);
  return Promise.resolve({ sent: true, to, subject });
}

function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    subject: 'Welcome to Taskr!'
  });
}

module.exports = { sendWelcomeEmail };
