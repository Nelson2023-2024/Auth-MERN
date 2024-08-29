import express from 'express';

express();
export const signUp = async (req, res) => {
  res.send('Signup route');
};

export const login = async (req, res) => {
  res.send('login route');
};

export const logout = async (req, res) => {
  res.send('logout route');
};
