const express = require('express');
const {sendMail, getInbox, getMailByUid, searchBySubject, searchByBody} = require('../controllers/mailController');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multer');


// router.use((req, res, next) => {
//   req.user = {
//     email: 'user3@yourdomain.com',      
//     password: 'rawPassword123'          
//   };
//   next();
// });


// router.post('/send', sendMail);
// router.get('/inbox', getInbox);
// router.get('/inbox/:uid', getMailByUid);

router.post('/send', authMiddleware, upload.single('attachment'),  sendMail);
router.get('/inbox', authMiddleware, getInbox);
router.get('/inbox/:uid',authMiddleware, getMailByUid);
router.get('/search/subject', authMiddleware, searchBySubject);
router.get('/search/body', authMiddleware, searchByBody);

module.exports = router;