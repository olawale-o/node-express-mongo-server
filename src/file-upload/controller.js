module.exports = {
  create: (req, res, next) => {
    try {
      console.log(req.file);
      return res.status(200).json({
        message: 'Success',
      });
    } catch (e) {
      console.log(e);
      return next(e);
    }
  },
};
