const BCCData = require('./BCCData')


module.exports = {
  createUserChain: async (owner, name, type)=>{
    const chainId = await BCCData.writeChain(owner, name, type)
    return {chainId}
  },
  getUserChainById: async (id)=>{
    const chain = await BCCData.readChainById(id)
    return chain
  },
  
}