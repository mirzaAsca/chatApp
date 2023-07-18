const IORedis = require('ioredis');
const client = new IORedis();

exports.rateLimiter = async (req, res, next) => {
  const { username } = req.user;

  try {
    const record = await client.get(username);

    if (record !== null) {
      return res.status(429).json({ message: 'Too many messages, please try again later' });
    } else {
      // Set the key to expire in 1 second
      await client.set(username, 'EX', 1, 'NX');
      next();
    }
  } catch (err) {
    throw err;
  }
};
