import { MailtrapClient } from 'mailtrap'
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE
} from './emailtemplates.js'
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

    console.log(`Email sent succefull`, response)
  } catch (error) {
    console.log(`Error sending email`, error.message)
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

export const sendForgotPasswordResetEmail = async (email, resetURL) => {
  const recipients = [{ email }]
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipients,
      subject: 'Reset your password',
      html: `${PASSWORD_RESET_REQUEST_TEMPLATE.replace(
        '{resetURL}',
        resetURL
      )}`,
      category: 'Password Reset'
    })
    console.log(`Reset URL is : ${resetURL}`)
  } catch (error) {
    console.log(`Error sending email`, error.message)
    throw new Error(`Error sending verification email: ${email}`)
  }
}

export const sendResetSuccessEmail = async (email, name) => {
  const recipient = [{ email }]

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: 'Successfully reseted your password',
      html: `${PASSWORD_RESET_SUCCESS_TEMPLATE.replace('{name}', name)}`,
      category: 'Password Reset'
    })
    console.log('Password rest email sent successfully', response)
  } catch (error) {
    console.log(`Error sending email`, error.message)
    throw new Error(`Error sending success email: ${email}`)
  }
}
