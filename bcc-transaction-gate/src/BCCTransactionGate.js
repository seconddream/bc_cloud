const express = require('express')
const bodyParser = require('body-parser')
const c = require('ansi-colors')

const Transaction = require('./transaction')

const app = express()

const handleError = (error, req, res, next) => {
  console.log(error)
  res.status(500).send(error.message)
}

app.use(bodyParser.json())

app.use((req, res, next) => {
  console.log(
    c.gray(`Transaction REQ: ${req.path} ${JSON.stringify(req.body)}`)
  )
  next()
})

app.post('/compile', async (req, res, next) => {
  try {
    const { sources, compilerVersion } = req.body

    if (!sources) throw new Error('Parameter reqired: sources.')

    if (!sources) throw new Error()
    res.send(await Transaction.compile(sources, compilerVersion))
  } catch (error) {
    next(error)
  }
})

// contract deploy route
app.post('/deployContract', async (req, res, next) => {
  try {
    const { chainId, abi, bytecode, deployArgs, gas, gasPrice } = req.body

    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!abi) throw new Error('Parameter reqired: abi.')
    if (!bytecode) throw new Error('Parameter reqired: bytecode.')

    res.send(
      await Transaction.deployContract(
        chainId,
        abi,
        bytecode,
        deployArgs,
        gas,
        gasPrice
      )
    )
  } catch (error) {
    next(error)
  }
})

// contract method call route
app.post(
  '/callContractMethod/:contractId/:methodName',
  async (req, res, next) => {
    try {
      const { contractId, methodName } = req.params
      const { callArgs, gas, gasPrice } = req.body
      res.send(
        await Transaction.callContractMethod(
          contractId,
          methodName,
          callArgs,
          gas,
          gasPrice
        )
      )
    } catch (error) {
      next(error)
    }
  }
)

// contract method call route
app.post(
  '/fireContractMethod/:contractId/:methodName',
  async (req, res, next) => {
    try {
      const { contractId, methodName } = req.params
      const { callArgs, gas, gasPrice } = req.body
      res.sendStatus(200)
      await Transaction.callContractMethod(
        contractId,
        methodName,
        callArgs,
        gas,
        gasPrice
      )
      
    } catch (error) {
      next(error)
    }
  }
)

app.use(handleError)

const startServer = port => {
  app
    .listen(port)
    .on('error', error => {
      console.log(error)
    })
    .on('listening', () => {
      console.log(c.gray(`TransactionGate listening at ${port}`))
    })
}

module.exports = {
  startServer
}
