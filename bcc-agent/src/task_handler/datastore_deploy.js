const fs = require('fs-extra')
const path = require('path')
const moment = require('moment')
const { callDBGate, callTransactionGate } = require('../connection')

const wait = timeout =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, timeout * 1000)
  })

const dataTypeIndex = ['string', 'int', 'float', 'boolean']

module.exports = async (task, taskLogger) => {
  const { params } = task
  const { userId, chainId, name, type, schema } = params
  console.log(schema)

  // read chain
  const chain = await callDBGate('/chain/readChain', { chainId })
  if (chain.config.type !== 'clique')
    throw new Error('Datastore only support clique type of chain.')
  const namespace = chain.deployment.namespace

  // create datastore in db
  const { datastoreId } = await callDBGate('/datastore/writeDatastore', {
    name,
    type,
    userId,
    chainId
  })

  // load source file
  let sources = {}
  try {
    sources[`${type}.sol`] = await fs.readFile(
      path.resolve(__dirname, `../datastore/${type}.sol`),
      'utf-8'
    )
  } catch (error) {
    console.log(error)
    throw new Error(`Type ${type} not supported.`)
  }

  // compile contract
  const compileResult = await callTransactionGate('/compile', { sources })
  // console.log(compileResult)
  const { compilerVersion, artifacts, compileErrors } = compileResult
  if (compileErrors.length > 0) {
    console.log(compileErrors)
    throw new Error('Contract compile failed.')
  }
  taskLogger.info(`${type} contract compiled.`)

  // deploy contract
  const receipt = await callTransactionGate('/deployContract', {
    chainId,
    abi: artifacts[type].abi,
    bytecode: artifacts[type].evm.bytecode.object,
    deployArgs: [datastoreId, name]
  })

  taskLogger.info(`${type} contract deployed at: ${receipt.contractAddress}`)

  // update datastore contract

  const { contractId } = await callDBGate('/contract/writeContract', {
    chainId,
    name: type,
    compilerVersion,
    abi: artifacts[type].abi,
    receipt
  })

  await callDBGate('/datastore/updateDatastoreContract', {
    datastoreId,
    contractId
  })

  taskLogger.info(`Datastore contract updated. ContractId: ${contractId}`)

  // publish datastore contract deployed message
  await callDBGate('/datastore/publishDatastore', { datastoreId, namespace })

  const startTime = moment().valueOf()
  const timeout = 30 * 1000
  while (true) {
    if (moment().valueOf() > startTime + timeout) {
      throw new Error('Failed to start datastore monitoring!')
    }
    const ds = await callDBGate('/datastore/readDatastore', { datastoreId })
    if (ds.monitoring) {
      taskLogger.info('Monitoring the datastore.')
      break
    } else {
      taskLogger.info('Waiting for monitoring to be started...')
      await wait(3)
    }
  }

  const datastoreBefore = await callDBGate('/datastore/readDatastore', {
    datastoreId
  })
  console.log('datastore before')
  console.log(datastoreBefore)

  // set schema
  await callDBGate('/datastore/setSchema', {
    datastoreId,
    schema
  })

  const datastoreAfter = await callDBGate('/datastore/readDatastore', {
    datastoreId
  })
  console.log('datastore after')
  console.log(datastoreAfter)

  // append datastore to chain and user

  await callDBGate('/chain/appendDatastore', { chainId, datastoreId })
  await callDBGate('/user/appendDatastore', { userId, datastoreId })

  taskLogger.info(`Datastore deployed.`)
}
