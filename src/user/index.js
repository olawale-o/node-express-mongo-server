const router = require('express').Router();

const controller = require('./controller');

router.post('/', controller.create);
router.post('/login', controller.login);
router.get('/', controller.allUsers);

module.exports = router;
