const IORedis = require("ioredis");

const messageClient = new IORedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: function (times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

messageClient.on("error", (err) => {
  console.log("Error", err);
});

// Message data structure
// id (IORedis will generate this id)
// sender
// text
// timestamp

module.exports = messageClient;
