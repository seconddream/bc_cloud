const express = require("express");
const bodyParser = require("body-parser");

const ServerApp = express();

// server midwares
ServerApp.use(bodyParser.json());

// server utils api
ServerApp.get("/", (req, res) => {
  res.send("API-Server ready.");
});

// // project api
// ServerApp.post('/projects')

// app.post('/projects/')
// app.get('/projects/:projectId/')
// app.delete('/projects/:projectId')

// // chain
// // one chain per project allowed
// app.post('/projects/:projectId/chain')
// app.get('/projects/:projectId/chain')
// app.delete('/projects/:projectId/chain')

// // micro-services in chain
// app.post('/projects/:projectId/services/')
// app.get('/projects/:projectId/services/:serviceId')
// app.delete('/projects/:projectId/services/:serviceId')

// // contracts in one micro-services (contracts as single file??)
// app.post('/projects/:projectId/services/:serviceId/contracts/')
// app.put('/projects/:projectId/services/:serviceId/contracts/')
// app.get('/projects/:projectId/services/:serviceId/contracts/versions/')
// app.get('/projects/:projectId/services/:serviceId/contracts/versions/version:Id')

// // exposed contract call
// app.get('/projectes/:projectId/service/:servicedId/apiCall/:apiName')

const startServer = port =>
  new Promise((resolve, reject) => {
    ServerApp.listen(port)
      .on("listening", () => {
        resolve();
      })
      .on("error", (error) => {
        reject(error);
      });
  });

module.exports = {
  startServer
};
