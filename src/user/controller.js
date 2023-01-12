const Datauri = require('datauri/parser');
const path = require('path');

const userService = require('./service');
const tokenService = require('../services/token-service');
const AppError = require('../common/app-error');
const cloudinaryService = require('../services/cloudinary-service');

const dUri = new Datauri();
module.exports = {
  create: async (req, res) => {
    const {
      username, password, name, email,
    } = req.body;
    try {
      const user = await userService.register({
        username,
        password,
        name,
        email,
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
        user: {
          id: user.insertedId,
          name,
          username,
          email,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return new AppError(500, 'Internal Server error');
    }
  },
  login: async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const user = await userService.login({ username, password });
      // eslint-disable-next-line no-underscore-dangle
      const accessToken = await tokenService.signAccessToken({ userId: user._id });
      // eslint-disable-next-line no-underscore-dangle
      const refreshToken = await tokenService.signRefreshToken({ userId: user._id });
      // eslint-disable-next-line no-underscore-dangle
      await userService.updateToken(user._id, { $set: { accessToken, refreshToken } });
      res.cookie('jwt', refreshToken, {
        httpOnly: true, sameSite: 'Lax', secure: false, maxAge: 1000 * 60 * 60 * 24,
      });
      return res.status(200).json({
        user: {
          // eslint-disable-next-line no-underscore-dangle
          id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return next(error);
    }
  },
  allUsers: async (req, res, next) => {
    try {
      const allUsers = await userService.getOtherUsers({ username: { $ne: req.query.q } });
      return res.status(200).json({
        users: allUsers,
      });
    } catch (error) {
      return next(error);
    }
  },
  update: async (req, res, next) => {
    const {
      email, name, username, id, avatar,
    } = req.body;
    try {
      let result = null;
      if (req.file) {
        const uploder = async (fileContent) => cloudinaryService.fileUploader(fileContent);
        const fileContent = dUri.format(
          path.extname(req.file.originalname).toString(),
          req.file.buffer,
        ).content;
        result = await uploder(fileContent);
      }

      await userService.updateProfile(id, {
        $set: {
          email, name, username, avatar: result?.secure_url || avatar,
        },
      }, {
        returnNewDocument: true,
      });
      const accessToken = await tokenService.signAccessToken({ userId: id });
      const refreshToken = await tokenService.signRefreshToken({ userId: id });
      // eslint-disable-next-line no-underscore-dangle
      const profile = await userService.updateToken(id, { $set: { accessToken, refreshToken } });
      res.cookie('jwt', refreshToken, {
        httpOnly: true, sameSite: 'None', secure: true, maxAge: 1000 * 60 * 60 * 24,
      });
      return res.status(200).json({
        user: {
          // eslint-disable-next-line no-underscore-dangle
          id,
          name: profile.value.name,
          username: profile.value.username,
          email: profile.value.email,
          avatar: profile.value.avatar,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      return next(error);
    }
  },
  refreshToken: async (req, res, next) => {
    const { cookies } = req;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    try {
      const accessToken = await userService.verifyRefereshToken({ refreshToken });
      return res.status(200).json({
        accessToken,
      });
    } catch (error) {
      return next(error);
    }
  },
};
