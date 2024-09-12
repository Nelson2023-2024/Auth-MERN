import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

import { Router } from 'express'
import { login, logout, signUp } from '../controllers/auth.controller.js'
import { User } from '../models/user.model.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import {
  sendForgotPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail
} from '../mailtrap/emails.js'

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

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: 'Email does nit exist' })

    //validateing password
    const validatePassword = await bcryptjs.compare(password, user.password)

    if (!validatePassword)
      return res
        .status(400)
        .json({ success: false, message: 'Password did not match' })

    //generate jwt
    generateTokenAndSetCookie(res, user.id)

    //update login history
    user.lastLogin = new Date() //now

    await user.save()

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined
      }
    })
  } catch (error) {
    console.log('error in login', error)
    res.status(400).json({ success: false, message: error.message })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ success: true, message: 'Logged out successfully' })
})

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body
  try {
    const user = await User.findOne({ email })
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' })

    //Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 ///1 hr

    user.resetPasswordToken = resetToken
    user.resetPasswordExpireAt = resetTokenExpiresAt

    user.save()

    //send ForgotPasswordEmail
    await sendForgotPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/api/auth/reset-password/${resetToken}`
    )

    res.status(200).json({
      success: true,
      message: 'Password rest link sent to your email'
    })
  } catch (error) {
    console.log('Error in forgotPassword', error)
    res.status(400), json({ success: false, message: error.message })
  }
})

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpireAt: { $gt: Date.now() } //to verify the token has not expired
    })
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'Invalid or Token Expired' })

    //if token is found and not expired
    //update password
    const hashPassword = await bcryptjs.hash(password, 10)

    user.password = hashPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpireAt = undefined

    await user.save()

    await sendResetSuccessEmail(user.email, user.name)

    res
      .status(200)
      .json({ success: true, message: 'Password rest successfully' })
  } catch (error) {
    console.log('Error in  resetPassword', error)
    res.status(400).json({ success: false, message: error.message })
  }
})

router.get(
  '/check-auth',
  (req, res, next) => {
    const token = req.cookies.token
    if (!token)
      res
        .status(401)
        .json({ success: false, message: 'Unauthorized no token provided' })
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET)
      if (!decode)
        return res
          .status(401)
          .json({ success: false, message: 'Unauthorized - Invalid token' })
      req.userid = decode.userid
      console.log('req.userid: ', req.userid)
      next()
    } catch (error) {
      console.log('Error in verifyToken', error)
      return res.status(500).json({ success: false, message: 'Server Error' })
    }
  },
  async (req, res) => {
    try {
      const user = await User.findById(req.userid).select('-password')
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: 'User not found' })
      res.status(200).json({ success: true, user })
    } catch (error) {
      console.log('Error in checkAuth', error)
      res.status(400).json({ success: false, message: error.message })
    }
  }
)
export default router
