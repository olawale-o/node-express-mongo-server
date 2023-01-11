/* eslint-disable no-underscore-dangle */
const jwt = require('jsonwebtoken');
const userService = require('../user/service');
const AppError = require('../common/app-error');

const signToken = (credentials, secretKey, expiresIn) => new Promise((resolve, reject) => {
  const { userId } = credentials;
  const options = {
    expiresIn,
    // issuer: 'http://localhost:5000',
    // audience: userId,
  };
  jwt.sign({ userId }, secretKey, options, (err, token) => {
    if (err) {
      reject(new AppError(403, 'Forbidden'));
    } else {
      resolve(token);
    }
  });
});

const verifyToken = (token, secretKey) => new Promise((resolve, reject) => {
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      reject(new Error({ isError: true, message: 'Invalid operation!' }));
    } else {
      resolve(decoded);
    }
  });
});

const newAccessToken = async (credentials) => signToken(credentials, 'ACCESS_TOKEN_SECRET', '1h');

const newfreshToken = async (credentials) => signToken(credentials, 'REFRESH_TOKEN_SECRET', 1000 * 60 * 60 * 24);

module.exports = {
  reIssueRefreshToken: async (token) => {
    const payload = await this.verifyRefreshToken(token);
    const userId = payload.aud;
    const user = await userService.getToken({ id: userId });
    if (!user) {
      throw new Error({ isError: true, message: 'User token does not exist' });
    }
    const userToken = user.refreshToken;
    if (userToken !== token) {
      throw new Error({ isError: true, message: 'Old token. Not valid anymore.' });
    }
    const [accessToken, refreshToken] = (
      Promise.all([newAccessToken(userId), newfreshToken(userId)])
    );
    await userService.updateToken(user._id, { $set: { refreshToken } });

    return { accessToken, refreshToken };
  },
  signAccessToken: async (credentials) => signToken(credentials, 'ACCESS_TOKEN_SECRET', '1h'),
  signRefreshToken: async (credentials) => signToken(credentials, 'REFRESH_TOKEN_SECRET', 1000 * 60 * 60 * 24),
  verifyAccessToken: async (credentials) => verifyToken(credentials, 'ACCESS_TOKEN_SECRET'),
  verifyRefreshToken: async (credentials) => verifyToken(credentials, 'REFRESH_TOKEN_SECRET'),
};
