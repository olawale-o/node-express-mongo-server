const userService = require('../user/service');
const tokenService = require('../services/token-service');
const AppError = require('../common/app-error');

module.exports = {
  refreshToken: async (req, res, next) => {
    const { cookies } = req;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    try {
      const foundUser = await userService.verifyRefereshToken({ refreshToken });
      const payload = await tokenService.verifyRefreshToken(refreshToken);
      if (!payload) {
        return new AppError(403, 'Forbidden');
      }
      // eslint-disable-next-line no-underscore-dangle
      if (payload.userId !== foundUser._id.toString()) {
        return new AppError(403, 'Forbidden');
      }
      // eslint-disable-next-line no-underscore-dangle
      const accessToken = await tokenService.signAccessToken({ userId: foundUser._id });
      return res.status(200).json({
        accessToken,
      });
    } catch (error) {
      return next(error);
    }
  },
};
