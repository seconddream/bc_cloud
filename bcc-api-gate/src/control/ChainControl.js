const { callDBGate } = require('../connection')

module.exports = {
  createChain: async (userId, name) => {
    const { chainId } = await callDBGate('/chain/writeChain', { userId, name })
    // await UserDAO.appendChain(userId, chainId)
    await callDBGate('/user/appendChain', { userId, chainId })
    return { chainId }
  },
  getChain: async chainId => {
    const chain = await callDBGate('/chain/readChain', {chainId})
    return chain
  },
  getUserChainList: async userId => {
    const { chains } = await callDBGate('/user/readUserById', {userId})
    const chainList = await callDBGate('/chain/readChainList', {chains})

    return chainList
  },
  updateChainConfiguration: async (chainId, config) => {
    await callDBGate('/chain/updateChainConfiguration', {chainId, config})
  },

  getChainProviderURL: async chainId => {
    const chain = await callDBGate('/chain/readChain', {chainId})
    if (!chain.deployment || !chain.deployment.namespace)
      throw new Error('Chain has not deployment.')
    return `http://transaction.${namespace}.svc.cluster.local:8545`
  }
}
