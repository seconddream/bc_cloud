const bluebird = require('bluebird')
const redis = require("redis");

bluebird.promisifyAll(redis)

// redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_SERVICE_HOST,
  port: process.env.REDIS_SERVICE_PORT
});

redisClient.on("error", error => {
  throw error;
});
redisClient.on("connect", () => {
  console.log("job-worker: connected to redis server...");
});


module.exports = {
  redisClient
}