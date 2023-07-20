const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const IORedis = require('ioredis');

const client = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

exports.authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Check if the token is invalidated
  const isInvalidated = await client.sismember("invalidatedTokens", token);
  if (isInvalidated) {
    return res.status(401).json({ error: 'The token is invalidated' });
  }

  // Check if the JWT_SECRET is defined
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Internal server error' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
