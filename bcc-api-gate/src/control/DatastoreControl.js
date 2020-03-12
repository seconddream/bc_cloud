const { callDBGate } = require('../connection')

module.exports = {
  getDatastore: async datastoreId => {
    const datastore = await callDBGate('/datastore/readDatastore', {
      datastoreId
    })
    return datastore
  },

  getUserDatastoreList: async userId => {
    const { datastores } = await callDBGate('/user/readUserById', { userId })
    const datastoreList = await callDBGate('/datastore/readDatastoreList', {
      datastores
    })
    return datastoreList
  },

  getChainDatastoreList: async chainId => {
    const { datastores } = await callDBGate('/chain/readChain', { chainId })
    const datastoreList = await callDBGate('/datastore/readDatastoreList', {
      datastores
    })
    return datastoreList
  },

  deleteChainDatastore: async (userId, chainId, datastoreId) => {
    await callDBGate('/datastore/deleteDatastore', {
      datastoreId
    })
    await callDBGate('/chain/removeDatastore', {
      chainId, datastoreId
    })
    await callDBGate('/user/removeDatastore', {
      userId, datastoreId
    })
  },

  setChainDatastoreSchema: async (datastoreId, schema) => {
    await callDBGate('/datastore/setSchema', {
      datastoreId,
      schema
    })
  }
}
