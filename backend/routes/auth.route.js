import bcryptjs from 'bcryptjs';

import {Router} from 'express';
import {login, logout, signUp} from '../controllers/auth.controller.js';
import {User} from '../models/user.model.js';
import {generateTokenAndSetCookie} from '../utils/generateTokenAndSetCookie.js';
import {sendVerificationEmail} from '../mailtrap/emails.js';

const router = Router();

router.post('/signup', async (req, res) => {
  const {email, password, name} = req.body;

  try {
    if (!email || !password || !name)
      throw new Error('All inputs are required');

    const userAlreadyExists = await User.findOne({email});
    console.log(userAlreadyExists);
    if (userAlreadyExists)
      return res.status(400).json({message: 'User already exists'});

    const hashedPassword = await bcryptjs.hash(password, 10);

    //creating a verification code
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    await user.save();

    //jwt
    generateTokenAndSetCookie(res, user._id);

    //sending verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      msg: 'User created succefully',
      user: {
        ...user._doc, //retun the whole user document
        password: undefined, //keep the password field undefined
      },
    });
  } catch (error) {
    return res.status(400).json({success: false, message: error.message});
  }
});

router.post('/login', (req, res) => {
  res.send('login route', login);
});

router.post('/logout', (req, res) => {
  res.send('logout route', logout);
});

export default router;
