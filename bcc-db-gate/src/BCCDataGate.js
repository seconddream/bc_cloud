const express = require('express')
const bodyParser = require('body-parser')
const c = require('ansi-colors')
const { mongoClient, redisClient } = require('./connection')

const userRouter = require('./data_api_router/user')
const chainRouter = require('./data_api_router/chain')
const contractRouter = require('./data_api_router/contract')
const datastoreRouter = require('./data_api_router/datastore')
const projectRouter = require('./data_api_router/project')
const serviceRouter = require('./data_api_router/service')
const taskRouter = require('./data_api_router/task')

const app = express()
app.use(bodyParser.json())

app.use((req, res, next) => {
  if (!req.path.includes('/task')) {
    console.log(c.gray(`DataGateCall: ${req.path} ${JSON.stringify(req.body)}`))
  }
  next()
})

const handleError = (error, req, res, next) => {
  console.log(error)
  res.status(500).send(error.message)
}

app.use('/user', userRouter)
app.use('/chain', chainRouter)
app.use('/contract', contractRouter)
app.use('/datastore', datastoreRouter)
app.use('/project', projectRouter)
app.use('/service', serviceRouter)
app.use('/task', taskRouter)

app.post('/server/clearData', async (req, res, next) => {
  try {
    await mongoClient.db('bcc-data').dropDatabase()
    await redisClient.flushdbAsync()
    res.send('Data cleared.')
  } catch (error) {
    next(error)
  }
})

app.use(handleError)

module.exports = {
  startServer: port => {
    app
      .listen(port)
      .on('error', error => {
        console.log(error)
      })
      .on('listening', () => {
        console.log(c.grey(`BCCDataGate listening now at ${port}...`))
      })
  }
}
