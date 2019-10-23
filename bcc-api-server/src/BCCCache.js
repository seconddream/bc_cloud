const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis)
const uuid = require('uuid/v1')

const redisHost = 'bcc-cache.default.svc.cluster.local'
const redisPort = 6379

let redisClient = null

const connectRedis = () => new Promise((resolve, reject)=>{
  redisClient = redis.createClient({
    host: redisHost, port: redisPort
  })
  redisClient.on('ready', ()=>{
    resolve()
  }).on('error', (error)=>{
    reject(error)
  })
})

const wait = (timeout) => new Promise((resolve, reject)=>{
  setTimeout(()=>{
    resolve()
  }, timeout * 1000)
})

const connect = async () => {
  const timeout = 5*60

  const startTime = Date.now()
  while (true) {
    if(Date.now()-startTime > timeout * 1000){
      throw new Error('Connect to redis time out.')
    }
    try {
      console.log(`Connecting to redis at ${redisHost}:${redisPort} ...`)
      await connectRedis()
      break
    } catch (error) {
      console.log(error);
      
      await wait(1)
    }
  }
  console.log(`Connected to redis at ${redisHost}:${redisPort}`)
  
};

const writeUserSigId = async (email)=>{
  const sigId = uuid()
  await redisClient.setAsync(`sig_id:${email}`, sigId)
  return sigId
}

const getUserSigId = async (email)=>{
  return await redisClient.getAsync(`sig_id:${email}`)
}

module.exports = {
  connect,
  writeUserSigId,
  getUserSigId,
}