const express = require("express");
const bodyParser = require("body-parser");
const Schema = require("validate");
const Web3 = require("web3");

const UserControl = require("./UserControl");
const UserChainControl = require('./UserChainControl')

const web3 = new Web3();
const app = express();

const validateRequest = (req, res, next) => {
  console.log(`Validateing ${req.path}`);
  next();
};

const handleError = (error, req, res, next) => {
  console.log(error);
  res.send({error: error.message})
};

// server midwares
app.use(bodyParser.json());
app.use(validateRequest);

// server utils api
app.get("/", (req, res) => {
  res.send("API-Server ready.");
});

// user api end points

app.get("/getLoginCredential", async (req,res, next)=>{
  try {
    const { email } = req.body
    const credential = await UserControl.getLoginCredential(email)
    res.send(credential)
  } catch (error) {
    next(error)
  }
});

app.post("/userLoginVerification", async (req, res, next)=>{
  try {
    const { email, sig } = req.body
    const token = await UserControl.loginVerification(email, sig)
    res.send(token)
  } catch (error) {
    next(error)
  }
});

app.post("/user", async (req, res, next)=>{
  try {
    const {email, accountAddr, keystore} = req.body
    const user = await UserControl.createUser(email, accountAddr, keystore)
    res.send(user)
  } catch (error) {
    next(error)
  }
});

app.get("/user/:userId", async (req, res, next) => {
  try {
    const user = await UserControl.getUser(req.params.userId)
    console.log(user)
    res.send(user)
  } catch (error) {
    next(error)
  }
});

app.delete("/user/:userId", async (req, res, next) => {
  try {
    console.log(req.params.userId);
    await UserControl.deleteUser(req.params.userId);
    res.send({deleted: req.params.userId});
  } catch (error) {
    next(error)
  }
});

// chain api end points --------------------------------------------------------

app.post('/chain', async(req, res, next)=>{
  try {
    const {owner, name, type} = req.body
    const chain = await UserChainControl.createUserChain(owner, name, type)
    res.send(chain)
  } catch (error) {
    next(error)
  }
})
app.get('/chain/:chainId', async(req, res, next)=>{
  try {
    const chain = await UserChainControl.getUserChainById(req.params.chainId)
    res.send(chain)
  } catch (error) {
    next(error)
  }
})
app.post('/chain/:chainId')
app.delete('/chain/:chainId')
app.post('/chain/:chainId/service')
app.get('/chain/:chainId/service')
app.get('/chain/:chainId/service/:serviceId')
app.delete('/chain/:chainId/service/:serviceId')



app.use(handleError);

const startServer = port =>
  new Promise((resolve, reject) => {
    app
      .listen(port)
      .on("listening", () => {
        console.log(`APIServer listening at ${port}`);
        resolve();
      })
      .on("error", error => {
        reject(error);
      });
  });

module.exports = {
  startServer
};
