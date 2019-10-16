const { startServer } = require("./server");
const CacheService = require('./cache')
const DBService = require('./db')

const wait = timeout =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout * 1000);
  });

const main = async () => {

  const dbConnectionTimeout = 600 * 1000
  const redisHost = 'bcc-cache.default.svc.cluster.local'
  const redisPort = 6379
  const mongoHost = 'bcc-db.default.svc.cluster.local'
  const mongoPort = 27017
  const apiServerPort = 5000;

  // connect to redis
  let startTime = Date.now()
  while (true) {
    try {
      console.log(`[api-server]: connecting to bcc-cache service at ${redisHost}:${redisPort}...`)
      await CacheService.connectToRedis(redisHost, redisPort)
      break
    } catch (error) {
      if(Date.now()-startTime > dbConnectionTimeout){
        console.log(error)
        throw new Error('Failed to connect to bcc-cache service.')
      }
      await wait(5)
    }
  }
  console.log(`[api-server]: bcc-cache service connected.`);

  // connect to mongo
  startTime = Date.now()
  while (true) {
    try {
      console.log(`[api-server]: connecting to bcc-db service at ${mongoHost}:${mongoPort}...`)
      await DBService.connetToMongo(mongoHost, mongoPort)
      break
    } catch (error) {
      if(Date.now()-startTime > dbConnectionTimeout){
        console.log(error)
        throw new Error('Failed to connect to bcc-db service.')
      }
      await wait(5)
    }
  }
  console.log(`[api-server]: bcc-db service connected.`);
  

  await startServer(apiServerPort);
  console.log(`[api-server]: api-server start listening at ${apiServerPort}...`);
};

main();
