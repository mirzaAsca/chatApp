const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const IORedis = require('ioredis');
let redis = User.client;

exports.register = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.verifyUser(username);
    if (userExists) {
      return res.status(400).json({ error: "Username already taken" });
    }

    await User.addUser(username, password);

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.getUser(username);

    if (!user || !user.password) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined in the environment variables.");
      return res.status(500).json({ error: "Internal server error" });
    }

    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set the JWT token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'strict', // or 'lax' depending on your needs
      secure: false, // set this to true if your website runs on https, otherwise set it to false
      maxAge: 3600000 // token expiration time in milliseconds, this is equal to 1 hour
    });

    res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    console.error("Login error:", error);
    next(error);
  }
};


exports.logout = async (req, res, next) => {
  // Add the existing token to the invalidated tokens set
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    await redis.sadd("invalidatedTokens", token);

    // Clear the token cookie
    res.clearCookie('token');

    res.status(200).json({ message: 'User logged out successfully' });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};

