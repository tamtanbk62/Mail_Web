const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login-laoid', userController.loginWithLaoID);
module.exports = router;