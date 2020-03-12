const moment = require('moment')
const { callDBGate, callTransactionGate } = require('../connection')

module.exports = {
  revokeDataEntry: async (datastoreId, dataIndex, caller = null) => {
    const t_cached = moment().valueOf()
    await callDBGate('/datastore/cacheRevokeDataEntry', {
      datastoreId,
      dataIndex,
      t_cached,
      caller
    })

    const { contract } = await callDBGate('/datastore/readDatastore', {
      datastoreId
    })
    callTransactionGate(`/callContractMethod/${contract}/deleteData`, {
      callArgs: [dataIndex, t_cached]
    })
  },
  createDataEntries: async (datastoreId, dataEntries, caller = null) => {
    const { contract } = await callDBGate('/datastore/readDatastore', {
      datastoreId
    })
    const { keys, keyDatatypes } = await callDBGate(
      '/datastore/readDatastore',
      { datastoreId }
    )
    for (const dataEntry of dataEntries) {
      const { dataIndex } = await callDBGate('/datastore/createDataEntry', {
        datastoreId,
        keyCount: keys.length()
      })
      for (const [keyName, value] of Object.entries(dataEntry)) {
        const t_cached = moment().valueOf()
        const keyIndex = keys.indexOf(keyName)
        await callDBGate('/datastore/cacheKeyValue', {
          datastoreId,
          dataIndex,
          keyIndex,
          value,
          t_cached,
          caller
        })
        // to do: send transaction to chain
        callTransactionGate(`/callContractMethod/${contract}/writeData`, {
          callArgs: [dataIndex, keyIndex, value, t_cached]
        })
      }
    }
  },

  changeDataEntryKeyValue: async (
    datastoreId,
    dataIndex,
    keyIndex,
    value,
    caller = null
  ) => {
    const t_cached = moment().valueOf()
    await callDBGate('/datastore/cacheKeyValue', {
      datastoreId,
      dataIndex,
      keyIndex,
      value,
      t_cached,
      caller
    })
    // todo: send transaction to chain
    const { contract } = await callDBGate('/datastore/readDatastore', {
      datastoreId
    })
    callTransactionGate(`/callContractMethod/${contract}/writeData`, {
      callArgs: [dataIndex, keyIndex, value, t_cached]
    })
  },

  readDataEntryByDataIndex: async (
    datastoreId,
    dataIndexSkip,
    retrieveCount = 10
  ) => {
    return await callDBGate('/datastore/readDataEntryByDataIndex', {
      datastoreId,
      dataIndexSkip,
      retrieveCount
    })
  },

  readDataEntryByWithFilter: async (datastoreId, filters) => {
    return await callDBGate('/datastore/readDataEntryWithFilter', {
      datastoreId,
      filters
    })
  }
}
