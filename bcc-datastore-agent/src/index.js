const Web3 = require('web3')
const { callDBGate, connectRedis } = require('./connection')

const init = async () => {
  const redisClient = await connectRedis()
  const namespace = process.env.NAMESPACE
  const channelName = `CreateDatastore:${namespace}`
  const providerURL = `ws://localhost:8546`
  const web3 = new Web3(providerURL)
  const currentGasPrice = await web3.eth.getGasPrice()
  console.log(
    `Connected to chain ${namespace}. Chain current gasPrice: ${currentGasPrice}`
  )

  // subscribe to redis event for datastore creation event
  redisClient.on('message', async (channel, message) => {
    console.log(`Datastore contract deploy message received: ${message}`)
    const datastoreId = message
    const datastore = await callDBGate('/datastore/readDatastore', {
      datastoreId
    })
    console.log(datastore)

    const contract = await callDBGate('/contract/readContract', {
      contractId: datastore.contract
    })
    const contractAddress = contract.receipt.contractAddress
    const abi = contract.abi
    const datastoreContract = new web3.eth.Contract(abi, contractAddress)
    console.log(`Datastore contract at: ` + contract.receipt.contractAddress)

    console.log('register callback for Datastore')

    // event handler for data written
    datastoreContract.events.ColumnCreated().on('data', async event => {
      const {
        datastoreId,
        columnIndex,
        columnName,
        columnDataType
      } = event.returnValues
      await callDBGate('/datastore/appendColumn', {
        datastoreId,
        columnIndex: parseInt(columnIndex),
        columnName,
        columnDataType
      })
      console.log(event)
    })

    // event handler for data written
    datastoreContract.events.DataWritten().on('data', async event => {
      const {
        datastoreId,
        rowIndex,
        columnIndex,
        columnName,
        columnDataType,
        historyIndex,
        t_bc
      } = event.returnValues
      await callDBGate('/datastore/confirmDataWritten', {
        datastoreId,
        rowIndex,
        columnName,
        historyIndex,
        t_bc
      })
      console.log(event)
    })

    datastoreContract.events.DataRowRevoked().on('data', async event => {
      const { datastoreId, rowIndex, t_bc } = event.returnValues
      await callDBGate('/datastore/confirmDataRowRevoked', {
        datastoreId,
        rowIndex,
        t_bc
      })
      console.log(event)
    })

    await callDBGate('/datastore/setMonitoring', { datastoreId })
    console.log(`Monitoring started.`)
  })
  redisClient.subscribe(channelName)
}

try {
  init()
} catch (error) {
  console.log(error)
  throw error
}
