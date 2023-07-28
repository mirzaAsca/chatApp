const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // Don't forget to import the auth middleware

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', auth.authenticate, userController.logout); // Add auth.authenticate before userController.logout

module.exports = router;
