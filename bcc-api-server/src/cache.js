const redis = require('redis')

let client = null

const connectToRedis = (host, port) => new Promise((resolve, reject)=>{

  client = redis.createClient({
    host, port
  })

  client.on('ready', ()=>{
    resolve()
  }).on('error', (error)=>{
    reject(error)
  })

})

module.exports={
  connectToRedis,
}