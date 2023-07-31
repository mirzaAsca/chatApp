// Import the required modules
const express = require('express');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// Initialize a router instance
const router = express.Router();

// Define the route for user registration. This route is handled by the register function in the userController.
router.post('/register', userController.register);

// Define the route for user login. This route is handled by the login function in the userController.
router.post('/login', userController.login);

// Define the route for user logout. This route is protected by the authentication middleware, so only logged-in users can access it.
// The auth.authenticate middleware function is called before the logout function in the userController. If the user is not authenticated, they will not be able to logout.
router.post('/logout', auth.authenticate, userController.logout);

// Export the router instance, which will be used in other parts of the application to handle user-related routes.
module.exports = router;
