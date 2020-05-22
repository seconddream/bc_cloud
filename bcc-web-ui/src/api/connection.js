const axios = require('axios')
const moment = require('moment')
const Web3 = require('web3')
const web3 = new Web3()

const baseURL = 'http://10.0.1.4/api'

const APIGateCall = async (method, url, body) => {
  try {
    let token_timestamp = moment.utc().format()
    let token_signature = ''
    try {
      const localSession = JSON.parse(
        window.localStorage.getItem('bcc_session')
      )
      if (localSession) {
        // console.log('set conn headers...')
        token_signature = web3.eth.accounts.sign(
          token_timestamp,
          localSession.account.privateKey
        ).signature
      }
    } catch (error) {
      console.log('Parse local session failed.')
      console.log(error)
    }
    // console.log(token_signature)
    const req = await axios({
      method,
      url,
      baseURL,
      headers: {
        'Token-Timestamp': token_timestamp,
        'Token-Signature': token_signature
      },
      data: body
    })
    console.log(`%c ${method.toUpperCase()} -> ${url}`, 'color: grey')
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
  }
}

module.exports = {APIGate}