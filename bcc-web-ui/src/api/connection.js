const Axios = require('axios')

const APIGateConnection = Axios.create({
  baseURL: 'http://10.0.1.4/api'
})

const APIGateCall = async (method, url, body)=>{
  try {
    
    const req = await APIGateConnection[method](url, body)
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
  post: async (url, body)=>{
    return await APIGateCall('post', url, body)
  },
  get: async (url, body)=>{
    return await APIGateCall('get', url, body)
  },
  put: async (url, body)=>{
    return await APIGateCall('put', url, body)
  },
  delete: async (url, body)=>{
    return await APIGateCall('delete', url, body)
  },
}


module.exports = { APIGate }
