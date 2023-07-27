const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const IORedis = require('ioredis');

const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

exports.authenticate = async (req, res, next) => {
  console.log('authenticate middleware called');  // Log that the middleware has been called

  const token = req.cookies.token;
  console.log('Incoming token:', token); // Add this line
  
  if (!token) {
    console.log('No token provided');  // Log that no token was provided
    return res.status(401).json({ error: 'No token provided' });
  }

  // Check if the token is invalidated
  const isInvalidated = await client.sismember("invalidatedTokens", token);
  if (isInvalidated) {
    console.log('The token is invalidated');  // Log that the token was invalidated
    return res.status(401).json({ error: 'The token is invalidated' });
  }

  // Check if the JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.log('Internal server error - JWT_SECRET not defined');  // Log that JWT_SECRET is not defined
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    console.log('Before jwt.verify');  // Add this line
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`Decoded user from JWT: ${JSON.stringify(user)}`);  // Add this line
    console.log('After jwt.verify');  // Add this line
    console.log('User:', user);  // Log the user object
    req.user = user;
    next();
} catch (error) {
    console.log('jwt.verify error:', error.message);
    return res.status(401).json({ error: 'Invalid token' });
}



};
