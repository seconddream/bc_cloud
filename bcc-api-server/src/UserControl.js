const BCCData = require('./BCCData')
const BCCCache = require('./BCCCache')


module.exports = {

  createUser: async (email, accountAddr, keystore)=>{
      const id = await BCCData.writeUser(email, accountAddr, keystore)
      return {id}
  },

  getLoginCredential: async(email)=>{
      const user = await BCCData.readUserByEmail(email)
      const sigId = await BCCCache.writeUserSigId(email)
      return {...user, sigId}
  },

  loginVerification: async(email, sig)=>{
      const user = await BCCData.readUserByEmail(email)
      return {}
  },

  getUser: async(id)=>{
    const user = await BCCData.readUserById(id)
    return user
  },

  deleteUser: async (id)=>{
    await BCCData.deleteUser(id)
  },



}