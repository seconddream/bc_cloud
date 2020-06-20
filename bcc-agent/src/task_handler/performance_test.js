const moment = require('moment')
const Web3=require('web3')
const web3 = new Web3()
const axios = require('axios')

let privateKey = null
let baseURL = 'http://bcc-api-gate.default.svc.cluster.local:5000/'

const APIGateCall = async (method, url, body) => {
  try {
    let token_timestamp = moment.utc().format()
    let token_signature = ''
    token_signature = web3.eth.accounts.sign(token_timestamp, privateKey)
      .signature
    // console.log(token_signature)
    const req = await axios({
      method,
      url,
      timeout: 1000 * 30,
      baseURL,
      headers: {
        'Token-Timestamp': token_timestamp,
        'Token-Signature': token_signature,
      },
      data: body,
    })
    // console.log(req)
    // console.log(`${method.toUpperCase()} -> ${url}`)
    // console.log(req.data)
    return req.data
  } catch (error) {
    console.log(error)
  }
}

const average = (arr) => arr.reduce((p, c) => p + c, 0) / arr.length

const sendBatchRequest = async (batchSize, method, url, body) => {
  const batchRequests = []
  const timeStart = moment().valueOf()
  for (let i = 0; i < batchSize; i++) {
    batchRequests.push(APIGateCall(method, url, body))
  }
  const responses = await Promise.all(batchRequests)
  const timeFinish = moment().valueOf()
  return {
    responses,
    timeStart,
    timeFinish,
    timeUsed: timeFinish - timeStart,
  }
}

const serviceStressTest = async (
  taskLogger,
  batchSize,
  testRound,
  serviceId,
  chainName,
  body
) => {
  const testDurations = []
  for (let i = 0; i < testRound; i++) {
    const testRunResult = await sendBatchRequest(
      batchSize,
      'post',
      `/service/${serviceId}`,
      body
    )
    testDurations.push(testRunResult.timeUsed)
  }
  const averageTestDuration = average(testDurations)
  taskLogger.info(
    `${testRound} rounds of ${batchSize} requests to ${serviceId} on ${chainName} | ${JSON.stringify(
      testDurations
    )}  | average: ${averageTestDuration} ms.`
  )
  return averageTestDuration
}

const datastoreWriteTest = async (taskLogger, rowCount, url, body) => {
  const startT = moment().valueOf()
  const testRunResult = await sendBatchRequest(
    rowCount,
    'post',
    url,
    JSON.parse(body)
  )
  const endT = moment().valueOf()

  taskLogger.info(`Test took ${endT-startT} ms.`)

}

const datastoreReadTest = async (taskLogger, operationCount, url, body) => {
  const startT = moment().valueOf()
  const testRunResult = await sendBatchRequest(
    operationCount,
    'post',
    url,
    JSON.parse(body)
  )
  const endT = moment().valueOf()
  taskLogger.info(`Test took ${endT-startT} ms.`)

}

module.exports = async (task, taskLogger) => {
  const { params } = task
  const { userId, pk, serviceId1c, serviceId1t, serviceId2c, serviceid2t, datastoreId, contractId} = params
  privateKey = pk
  taskLogger.info('Service Performance Test(Call only) - Target Chain1')
  await serviceStressTest(taskLogger ,100, 5, serviceId1c, 'chain1')

  taskLogger.info('\r')

  taskLogger.info('Service Performance Test(Transaction) - Target Chain1')
  await serviceStressTest(taskLogger, 100, 5, serviceId1t, 'chain1', {
    option: {
      callArgs: ['test'],
    },
  })

  taskLogger.info('\r')

  taskLogger.info(
    'Performance Comparsion Test(Call only) - Target Chain1 vs Chain2'
  )
  const callPCTResultsChain1 = []
  const callPCTResultsChain2 = []
  for (let i = 0; i < 6; i++) {
    callPCTResultsChain1.push(
      await serviceStressTest(taskLogger, 50, 5, serviceId1c, 'chain1')
    )
    callPCTResultsChain2.push(
      await serviceStressTest(taskLogger, 50, 5, serviceId2c, 'chain2')
    )
  }
  taskLogger.info(`chain1 averages: ${JSON.stringify(callPCTResultsChain1)}`)
  taskLogger.info(`chain2 averages: ${JSON.stringify(callPCTResultsChain2)}`)

  taskLogger.info('\r')

  taskLogger.info(
    'Performance Comparsion Test(Transaction) - Target Chain1 vs Chain2'
  )
  const transPCTResultsChain1 = []
  const transPCTResultsChain2 = []
  for (let i = 0; i < 6; i++) {
    transPCTResultsChain1.push(
      await serviceStressTest(taskLogger, 50, 5, serviceId1t, 'chain1', {
        option: {
          callArgs: ['test'],
        },
      })
    )
    transPCTResultsChain2.push(
      await serviceStressTest(taskLogger, 50, 5, serviceid2t, 'chain2', {
        option: {
          callArgs: ['test'],
        },
      })
    )
  }
  taskLogger.info(`chain1 averages: ${JSON.stringify(transPCTResultsChain1)}`)
  taskLogger.info(`chain2 averages: ${JSON.stringify(transPCTResultsChain2)}`)

  taskLogger.info('\r')

  taskLogger.info(`Datastore Write Test - 100 data rows`)
  await datastoreWriteTest(
    taskLogger,
    1000,
    `${baseURL}/datastore/${datastoreId}/${contractId}/row`,
    '{"row":{"name":{"columnIndex":0,"columnName":"name","columnDataType":"string","dataValue":"jim"},"age":{"columnIndex":1,"columnName":"age","columnDataType":"integer","dataValue":"33"}}}'
  )

  taskLogger.info(`Datastore Read Test - 100 read operation of first 10 rows.`)
  await datastoreReadTest(
    taskLogger, 
    1000,
    `${baseURL}/datastore/${datastoreId}/read`,
    '{"rowIndexSkip": 0, "retrieveCount": 10}'
  )

}
