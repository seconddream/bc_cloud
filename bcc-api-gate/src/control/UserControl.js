const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider)
const { callDBGate } = require('../connection')

module.exports = {
  // user sign up
  signUp: async (email, accountAddr, keystore) => {
    const user = await callDBGate('/user/writeUser', {
      email,
      accountAddr,
      keystore
    })
    const { userId } = user
    await callDBGate('/user/refreshUserToken', { userId })
    return user
  },

  // get user credenital
  getCredential: async email => {
    const { userId, keystore } = await callDBGate('/user/readUserByEmail', {
      email
    })
    const token = await callDBGate('/user/refreshUserToken', { userId })
    return { keystore, token }
  },

  // login with signed token
  login: async (email, signedToken) => {
    const { userId, accountAddr } = await callDBGate('/user/readUserByEmail', {
      email
    })
    const token = await callDBGate('/user/readUserToken', {
      userId
    })
    let accountAddrRecovered = null
    try {
      accountAddrRecovered = web3.eth.accounts.recover(token, signedToken)
    } catch (error) {
      throw new Error('Token recover failed.')
    }
    if (accountAddr !== accountAddrRecovered)
      throw new Error('Login verification failed.')
    return { userId }
  },

  // get user
  getUser: async userId => {
    const user = await await callDBGate('/user/readUserById', {
      userId
    })
    delete user.accountAddr
    delete user.keystore
    return user
  },

  // delete user
  deleteUser: async userId => {
    await await await callDBGate('/user/deleteUser', {
      userId
    })
  }
}
