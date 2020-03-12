const Axios = require('axios')

const DBGate = Axios.create({
  baseURL: 'http://bcc-db-gate.default.svc.cluster.local:5000'
})

const TransactionGate = Axios.create({
  baseURL: 'http://bcc-transaction-gate.default.svc.cluster.local:5000'
})

const callDBGate = async (url, body={}) => {
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

const callTransactionGate = async (url, body={}) => {
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

module.exports = { callDBGate, callTransactionGate }
