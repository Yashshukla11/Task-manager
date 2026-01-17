import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, 'quicktask');
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, 'quicktask');
  } catch (error) {
    return null;
  }
};
