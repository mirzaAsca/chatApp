// Import required modules
const jwt = require("jsonwebtoken");
const IORedis = require("ioredis");

// Initialize a new Redis client
const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});
console.log(
  `Testing something ${process.env.REDIS_HOST}, ${process.env.REDIS_PORT}, ${process.env.REDIS_PASSWORD}}`
);
// Middleware function to authenticate the user
exports.authenticate = async (req, res, next) => {
  // Retrieve the token from the request cookies
  const token = req.cookies.token;

  // If no token is provided, return an error
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  // Check if the token has been invalidated
  const isInvalidated = await client.sismember("invalidatedTokens", token);

  // If the token is invalidated, return an error
  if (isInvalidated) {
    return res.status(401).json({ error: "The token is invalidated" });
  }

  // If the JWT_SECRET environment variable is not defined, return an error
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: "Internal server error" });
  }

  try {
    // Verify the JWT token and extract the user information
    const user = jwt.verify(token, process.env.JWT_SECRET);

    // Assign the user object to the request object
    req.user = user;

    // Continue to the next middleware function
    next();
  } catch (error) {
    // If the JWT verification fails, return an error
    return res.status(401).json({ error: "Invalid token" });
  }
};
