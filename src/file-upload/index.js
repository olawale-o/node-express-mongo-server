const router = require('express').Router();
const multer = require('multer');
const controller = require('./controller');

const upload = multer({ dest: `${process.cwd()}/storage` });

// const multerStorage = require('../middlewares/multer-storage');

router.post('/', upload.single('image'), controller.create);
router.get('/video-chunk', controller.getVideo);
// router.post('/:id/videos', multerStorage.single('video'), controller.newVideoUpload);
router.post('/:id/videos', controller.newVideoUpload);
router.get('/signature', controller.getSignature);

module.exports = router;
