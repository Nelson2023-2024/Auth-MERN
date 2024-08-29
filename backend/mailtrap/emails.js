import {VERIFICATION_EMAIL_TEMPLATE} from './emailtemplates.js';
import {mailtrapClient, recipients, sender} from './mailtrap.config.js';

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{email}];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Verify your email',
      html: `${VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      )}`,
      category: 'Email verification',
    });

    console.log(`Email sent succefull`);
  } catch (error) {
    console.log(`Error sending email` + error.message);
    throw new Error(`Error sending verification email: ${email}`);
  }
};
