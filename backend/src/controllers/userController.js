const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const userExists = await User.verifyUser(username, password);
    if (userExists) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Save the user to the database
    await User.addUser(username, password);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const validPassword = await User.verifyUser(username, password);
  
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid password' });
    }
  
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
