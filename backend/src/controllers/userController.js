const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const IORedis = require("ioredis");
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
    console.log("Login attempt:", username); // Log the username of the login attempt

    const user = await User.getUser(username);

    if (!user || !user.password) {
      console.log("Login error: User does not exist"); // Log if the user does not exist
      return res.status(400).json({ error: "User does not exist" });
    }

    const validPassword = await bcryptjs.compare(password, user.password);

    if (!validPassword) {
      console.log("Login error: Invalid password"); // Log if the password is invalid
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
    res.cookie("token", token);

    console.log("Login successful:", username); // Log if the login is successful

    res.status(200).json({ message: "User logged in successfully", username });
  } catch (error) {
    console.error("Unhandled error in login:", error); // Log any unhandled errors
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  // Add the existing token to the invalidated tokens set
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  if (!req.user || !req.user.username) {
    return res.status(400).json({ error: "Invalid user" });
  }

  try {
    await redis.sadd("invalidatedTokens", token);

    // Clear the token cookie
    res.clearCookie("token");

    // Emit logout event
    const io = req.io;
    io.emit("logout", req.user.username); // assuming req.user.username is available

    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    next(error);
  }
};
