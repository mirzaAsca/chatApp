const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const IORedis = require('ioredis');

const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

exports.authenticate = async (req, res, next) => {
  console.log('authenticate middleware called');
  const token = req.cookies.token;

  console.log('Token:', token);

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'No token provided' });
  }

  // Check if the token is invalidated
  const isInvalidated = await client.sismember("invalidatedTokens", token);
  console.log('Is token invalidated?', isInvalidated);
  
  if (isInvalidated) {
    console.log('The token is invalidated');
    return res.status(401).json({ error: 'The token is invalidated' });
  }

  // Check if the JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    console.log('Internal server error: JWT_SECRET is not defined');
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    console.log('Before jwt.verify');
    const user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('After jwt.verify');
    req.user = user;
    next();
  } catch (error) {
    console.log('jwt.verify error:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};
