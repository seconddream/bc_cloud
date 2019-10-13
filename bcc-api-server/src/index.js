const express = require('express')
const bodyParser = require('body-parser')
const projectApi = require('./project')

const port = 5000
const app = express()
app.use(bodyParser.json())

app.get('/', (req, res)=>{
  console.log('api server getting request....')
  res.send('API-Server response')
})

// project ---------------------------------------------------------------------

app.post('/projects/')
app.get('/projects/:projectId/')
app.delete('/projects/:projectId')

// chain
// one chain per project allowed
app.post('/projects/:projectId/chain', projectApi.deployChain)
app.get('/projects/:projectId/chain')
app.delete('/projects/:projectId/chain')

// micro-services in chain
app.post('/projects/:projectId/services/')
app.get('/projects/:projectId/services/:serviceId')
app.delete('/projects/:projectId/services/:serviceId')

// contracts in one micro-services (contracts as single file??)
app.post('/projects/:projectId/services/:serviceId/contracts/')
app.put('/projects/:projectId/services/:serviceId/contracts/')
app.get('/projects/:projectId/services/:serviceId/contracts/versions/')
app.get('/projects/:projectId/services/:serviceId/contracts/versions/version:Id')

// exposed contract call
app.get('/projectes/:projectId/service/:servicedId/apiCall/:apiName')

// helper apis
app.delete('/jobQueue', async(req, res)=>{
  try {
    await api.clearJobQueue()
    res.json({error:null})
  } catch (error) {
    res.json({error})
  }
})

app.get('/jobQueue', async(req, res)=>{
  try {
    const queue = await api.getJobQueue()
    res.json({error: null, queue})
  } catch (error) {
    res.json({error})
  }
})


app.listen(port, ()=>{
  console.log(`api_server: listening at ${port}...`)
})


