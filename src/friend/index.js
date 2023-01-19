const router = require('express').Router();
const controller = require('./controller');

router.get('/suggestions', controller.friendSuggestions);

module.exports = router;
