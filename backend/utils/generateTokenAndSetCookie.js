import jwt from 'jsonwebtoken';

export const generateTokenAndSetCookie = (res, userid) => {
  const token = jwt.sign({userid}, process.env.JWT_SECRET, {expiresIn: '7d'});

  console.log('JWT-token:' + token);

  res.cookie('token', token, {
    httpOnly: true, // Prevents client-side access to the cookie
    secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
    sameSite: 'strict', //prevents csrf attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });

  return token;
};
