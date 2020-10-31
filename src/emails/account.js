const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (user) => {
    const msg = {
        to: user.email, // Change to your recipient
        from: 'dipalmodi@hotmail.com', // Change to your verified sender
        subject: 'Thank you for signing up with task-manager app.',
        text: `Welcome ${user.name} to task-manager app. Hope you like it.`,
        html: `<strong>Welcome ${user.name} to task-manager app. Hope you like it.</strong>`,
      }

      sgMail.send(msg);
}

const sendCancellationEmail = (user) => {
    const msg = {
        to: user.email, // Change to your recipient
        from: 'dipalmodi@hotmail.com', // Change to your verified sender
        subject: 'Sorry to see you go!',
        text: `Hello ${user.name}, Please let us know if there was something we could have done better.`,
        html: `<strong>Hello ${user.name}, Please let us know if there was something we could have done better.</strong>`,
      }

      sgMail.send(msg);
}


module.exports = {
    sendWelcomeEmail: sendWelcomeEmail,
    sendCancellationEmail: sendCancellationEmail
}