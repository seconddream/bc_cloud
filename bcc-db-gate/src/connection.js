const c = require('ansi-colors')
const MongoClient = require('mongodb').MongoClient
const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis)

const db_username = process.env.DB_USERNAME
const db_password = process.env.DB_PASSWORD

const mongoHost = 'bcc-db.default.svc.cluster.local'
const mongoPort = 27017
const mongoURL = `mongodb://${encodeURI(db_username)}:${encodeURI(
  db_password
)}@${mongoHost}:${mongoPort}/?authMechanism=DEFAULT`

const mongoClient = new MongoClient(mongoURL, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

mongoClient
  .connect()
  .catch(error => {
    throw error
  })
  .then(() => {
    console.log(c.gray(`Connected to mongo at ${mongoHost}:${mongoPort}.`))
  })

const redisHost = 'bcc-cache.default.svc.cluster.local'
const redisPort = 6379

const redisClient = redis
  .createClient({
    host: redisHost,
    port: redisPort
  })
  .on('error', error => {
    throw error
  })
  .on('ready', () => {
    console.log(c.gray(`Connected to redis at ${redisHost}:${redisPort}`))
  })

module.exports = {
  mongoClient, redisClient
}
