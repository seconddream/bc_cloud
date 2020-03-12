const Axios = require('axios')
const redis = require('redis')

const redisHost = 'bcc-cache.default.svc.cluster.local'
const redisPort = 6379

const connectRedis = () =>
  new Promise((resolve, reject) => {
    const client = redis
      .createClient({ host: redisHost, port: redisPort })
      .on('error', error => {
        console.log('Conect to redis failed.')
        reject(error)
      })
      .on('ready', () => {
        console.log(`Connected to redis at ${redisHost}:${redisPort}`)
        resolve(client)
      })
  })

const DBGate = Axios.create({
  baseURL: 'http://bcc-db-gate.default.svc.cluster.local:5000'
})

const TransactionGate = Axios.create({
  baseURL: 'http://bcc-transaction-gate.default.svc.cluster.local:5000'
})

const callDBGate = async (url, body = {}) => {
  try {
    const req = await DBGate.post(url, body)
    return req.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data)
    } else {
      throw error
    }
  }
}

const callTransactionGate = async (url, body = {}) => {
  try {
    const req = await TransactionGate.post(url, body)
    return req.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data)
    } else {
      throw error
    }
  }
}

module.exports = { callDBGate, callTransactionGate, connectRedis }
