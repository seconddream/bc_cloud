const express = require('express')
const moment = require('moment')
const Web3 = require('web3')
const bodyParser = require('body-parser')
const c = require('ansi-colors')

const web3 = new Web3(Web3.givenProvider)

const { callDBGate } = require('./connection')
const authRouther = require('./router/AuthRouter')
const userRouter = require('./router/UserRouter')
const chainRouter = require('./router/ChainRouter')
const taskRouter = require('./router/TaskRouter')
const projectRouter = require('./router/ProjectRouter')
const contractRouter = require('./router/ContractRouter')
const serviceRouter = require('./router/ServiceRouter')
const datastoreRouter = require('./router/DatastoreRouter')
const serviceCallRouter = require('./router/ServiceCallRouter')
const datastoreCallRouter = require('./router/DataStoreCallRouter')

const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use((req, res, next) => {

  if(!req.path.includes('/task'))
    console.log(c.gray(`APIGate REQ: ${req.path} ${JSON.stringify(req.body)}`))
  next()
})

const handleError = (error, req, res, next) => {
  console.log(error)
  res.status(500).send(error.message)
}

app.use('/', authRouther)
app.use('/user', userRouter)
app.use('/user', chainRouter)
app.use('/user', taskRouter)
app.use('/user', projectRouter)
app.use('/user', contractRouter)
app.use('/user', serviceRouter)
app.use('/user', datastoreRouter)
app.use('/service', serviceCallRouter)
app.use('/datastore', datastoreCallRouter)

app.get('/server/status', async (req, res, next) => {
  res.send('Server running.')
})

app.get('/server/clearData', async (req, res, next) => {
  try {
    res.send(await callDBGate('/server/clearData'))
  } catch (error) {
    next(error)
  }
})

app.use(handleError)



const startServer = port => {
  app
    .listen(port)
    .on('error', error => {
      console.log(error)
    })
    .on('listening', () => {
      console.log(c.gray(`BCCAPIGate listening at ${port}`))
    })
}

module.exports = {
  startServer
}
