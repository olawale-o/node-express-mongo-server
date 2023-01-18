const router = require('express').Router();

router.get('/refresh-token', require('./controller').refreshToken);

module.exports = router;
