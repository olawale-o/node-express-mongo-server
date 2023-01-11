const router = require('express').Router();
const multerStorage = require('../middlewares/multer-storage');

const controller = require('./controller');

router.post('/new', controller.create);
router.post('/login', controller.login);
router.get('/', controller.allUsers);
router.put('/', multerStorage.single('profile'), controller.update);
router.put('/token/refresh', controller.refreshToken);

module.exports = router;
