const userService = require('./service');
const tokenService = require('../services/token-service');
const AppError = require('../common/app-error');

module.exports = {
  create: async (req, res) => {
    const { username, password, name } = req.body;
    try {
      const user = await userService.register({
        username, password, name, createdAt: new Date(), updatedAt: new Date(),
      });
      if (!user) {
        console.log('error');
      }
      const accessToken = await tokenService.signAccessToken({ userId: user.insertedId });
      const refreshToken = await tokenService.signRefreshToken({ userId: user.insertedId });
      await userService.updateToken(user.insertedId, { $set: { accessToken, refreshToken } });
      res.cookie('jwt', refreshToken, {
        httpOnly: true, sameSite: 'None', secure: true, maxAge: 1000 * 60 * 60 * 24,
      });
      return res.status(201).json({
        id: user.insertedId,
        name,
        username,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      return new AppError(500, 'Internal Server error');
    }
  },
  login: async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await userService.login({ username, password });
      const accessToken = await tokenService.signAccessToken({ userId: user.insertedId });
      const refreshToken = await tokenService.signRefreshToken({ userId: user.insertedId });
      // await userService.updateToken(user.insertedId, { $set: { accessToken, refreshToken } });
      res.cookie('jwt', refreshToken, {
        httpOnly: true, sameSite: 'None', secure: true, maxAge: 1000 * 60 * 60 * 24,
      });
      return res.status(200).json({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.log(error);
      return next(error);
    }
  },
};
