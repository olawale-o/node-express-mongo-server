// const AppError = require('../common/app-error');
const service = require('./service');

module.exports = {
  friendSuggestions: async (req, res, next) => {
    try {
      const { q } = req.query;
      const suggestions = await service.friendSuggestions({ userId: q });
      return res.status(200).json(suggestions);
    } catch (error) {
      return next(error);
    }
  },
};
