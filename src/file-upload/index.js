const router = require('express').Router();
const multer = require('multer');
const controller = require('./controller');

const upload = multer({ dest: `${process.cwd()}/storage` });

router.post('/', upload.single('image'), controller.create);
router.get('/video-chunk', controller.getVideo);

module.exports = router;
