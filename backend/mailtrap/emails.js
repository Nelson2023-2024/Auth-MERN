import { VERIFICATION_EMAIL_TEMPLATE } from './emailtemplates.js'
import { mailtrapClient, recipients, sender } from './mailtrap.config.js'

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }]
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Verify your email',
      html: `${VERIFICATION_EMAIL_TEMPLATE.replace(
        '{verificationCode}',
        verificationToken
      )}`,
      category: 'Email verification'
    })

    console.log(`Email sent succefull`)
  } catch (error) {
    console.log(`Error sending email` + error.message)
    throw new Error(`Error sending verification email: ${email}`)
  }
}

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }]
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: '908f8258-913e-41d0-9fe0-520b64e60236',
      template_variables: {
        company_info_name: 'Auth Company',
        name: `${name}`
      }
    })
    console.log('Welcome Email sent succefully', response)
  } catch (error) {
    console.error('Error sending the welcome email', error)
    throw new Error(`Error sending welcome email: ${error}`)
  }
}
