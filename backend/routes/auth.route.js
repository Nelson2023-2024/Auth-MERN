import bcryptjs from 'bcryptjs'

import { Router } from 'express'
import { login, logout, signUp } from '../controllers/auth.controller.js'
import { User } from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import { sendVerificationEmail, sendWelcomeEmail } from '../mailtrap/emails.js'

const router = Router()

router.post('/signup', async (req, res) => {
  const { email, password, name } = req.body

  try {
    if (!email || !password || !name) throw new Error('All inputs are required')

    const userAlreadyExists = await User.findOne({ email })
    console.log(userAlreadyExists)
    if (userAlreadyExists)
      return res.status(400).json({ message: 'User already exists' })

    const hashedPassword = await bcryptjs.hash(password, 10)

    //creating a verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString()

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
    })

    await user.save()

    //jwt
    generateTokenAndSetCookie(res, user._id)

    //sending verification email
    await sendVerificationEmail(user.email, verificationToken)

    res.status(201).json({
      msg: 'User created succefully',
      user: {
        ...user._doc, //retun the whole user document
        password: undefined //keep the password field undefined
      }
    })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/verify-email', async (req, res) => {
  //1 2 3 4 5 6
  const { code } = req.body
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    })

    //
    if (!user)
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      })
    //if the token is found and not expired we are not going to be needing them any more
    user.isVerified = true
    user.verificationToken = undefined
    user.verificationTokenExpiresAt = undefined
    await user.save()

    //sending welcome email
    await sendWelcomeEmail(user.email, user.name)

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    console.log('error in verifyEmail', error)
    res.status(500).json({ success: false, message: 'Sever Error' })
  }
})

router.post('/login', (req, res) => {
  res.send('login route')
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ success: true, message: 'Logged out successfully' })
})

export default router
