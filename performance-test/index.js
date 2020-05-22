const Web3 = require('web3')
const axios = require('axios')
const moment = require('moment')
const web3 = new Web3()

const baseURL = 'http://10.0.1.4/api'
const privateKey = ''

const APIGateCall = async (method, url, body) => {
  try {
    let token_timestamp = moment.utc().format()
    let token_signature = ''
    token_signature = web3.eth.accounts.sign(
      token_timestamp,
      privateKey
    ).signature
    console.log(token_signature)
    const req = await axios({
      method,
      url,
      baseURL,
      headers: {
        'Token-Timestamp': token_timestamp,
        'Token-Signature': token_signature,
      },
      data: body,
    })
    console.log(req)
    console.log(`${method.toUpperCase()} -> ${url}`)
    console.log(req.data)
    return req.data
  } catch (error) {
    console.log(error.response)
    if (error.response) {
      throw new Error(error.response.data)
    } else {
      throw error
    }
  }
}

const APIGate = {
  post: async (url, body) => {
    return await APIGateCall('post', url, body)
  },
  get: async (url, body) => {
    return await APIGateCall('get', url, body)
  },
  put: async (url, body) => {
    return await APIGateCall('put', url, body)
  },
  delete: async (url, body) => {
    return await APIGateCall('delete', url, body)
  },
}

const runTest = async ()=>{
  console.log('start...')
  console.log(await APIGate.post('http://10.0.1.4/api/service/5ec68904101752004ea97f48'))
}

runTest()