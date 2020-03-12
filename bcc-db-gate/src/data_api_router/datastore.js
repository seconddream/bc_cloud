const { Router } = require('express')
const DataStoreDAO = require('../data_dao/datastore')

const router = new Router()

router.post('/writeDatastore', async (req, res, next) => {
  try {
    const { name, type, userId, chainId } = req.body
    if (!name) throw new Error('Parameter reqired: name.')
    if (!type) throw new Error('Parameter reqired: type.')
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    res.send(await DataStoreDAO.writeDatastore(name, type, userId, chainId))
  } catch (error) {
    next(error)
  }
})

router.post('/readDatastore', async (req, res, next) => {
  try {
    const { datastoreId } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    res.send(await DataStoreDAO.readDatastore(datastoreId))
  } catch (error) {
    next(error)
  }
})

router.post('/readDatastoreList', async (req, res, next) => {
  try {
    const { datastores } = req.body
    if (!datastores) throw new Error('Parameter reqired: datastores.')
    res.send(await DataStoreDAO.readDatastoreList(datastores))
  } catch (error) {
    next(error)
  }
})

router.post('/deleteDatastore', async (req, res, next) => {
  try {
    const { datastoreId } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    await DataStoreDAO.deleteDatastore(datastoreId)
    await DataStoreDAO.deleteDataCollection(datastoreId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateDatastoreContract', async (req, res, next) => {
  try {
    const { datastoreId, contractId } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!contractId) throw new Error('Parameter reqired: contractId.')
    await DataStoreDAO.updateDatastoreContract(datastoreId, contractId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/publishDatastore', async (req, res, next) => {
  try {
    const { datastoreId, namespace } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!namespace) throw new Error('Parameter reqired: namespace.')
    await DataStoreDAO.publishDatastore(datastoreId, namespace)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/setMonitoring', async (req, res, next) => {
  try {
    const { datastoreId } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    await DataStoreDAO.setMonitoring(datastoreId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/setSchema', async (req, res, next) => {
  try {
    const { datastoreId, schema } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!schema) throw new Error('Parameter reqired: schema.')
    await DataStoreDAO.setSchema(datastoreId, schema)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/cacheRevokeDataEntry', async (req, res, next) => {
  try {
    const { datastoreId, dataIndex, t_cached, caller } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!dataIndex) throw new Error('Parameter reqired: dataIndex.')
    if (!t_cached) throw new Error('Parameter reqired: t_cached.')
    if (!caller) throw new Error('Parameter reqired: caller.')
    await DataStoreDAO.cacheRevokeDataEntry(
      datastoreId,
      dataIndex,
      t_cached,
      caller
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/comfirmRevokeDataEntry', async (req, res, next) => {
  try {
    const {
      datastoreId,
      dataIndex,
      t_cached,
      t_mined,
      transactionHash
    } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!dataIndex) throw new Error('Parameter reqired: dataIndex.')
    if (!t_cached) throw new Error('Parameter reqired: t_cached.')
    if (!t_mined) throw new Error('Parameter reqired: t_mined.')
    if (!transactionHash) throw new Error('Parameter reqired: transactionHash.')
    await DataStoreDAO.comfirmRevokeDataEntry(
      datastoreId,
      dataIndex,
      t_cached,
      t_mined,
      transactionHash
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

// datastore data router -------------------------------------------------------


router.post('/createDataEntry', async (req, res, next) => {
  try {
    const { datastoreId, keyCount } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!keyCount) throw new Error('Parameter reqired: keyCount.')
    const dataIndex = await DataStoreDAO.getNextDataIndex(datastoreId)
    await DataStoreDAO.createDataEntry(datastoreId, dataIndex, keyCount)
    res.sendStatus({dataIndex})
  } catch (error) {
    next(error)
  }
})

router.post('/cacheKeyValue', async (req, res, next) => {
  try {
    const {
      datastoreId,
      dataIndex,
      keyIndex,
      value,
      t_cached,
      caller
    } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!dataIndex) throw new Error('Parameter reqired: dataIndex.')
    if (!keyIndex) throw new Error('Parameter reqired: keyIndex.')
    if (!value) throw new Error('Parameter reqired: value.')
    if (!t_cached) throw new Error('Parameter reqired: t_cached.')
    if (!caller) throw new Error('Parameter reqired: caller.')
    await DataStoreDAO.cacheKeyValue(
      datastoreId,
      dataIndex,
      keyIndex,
      value,
      t_cached,
      caller
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/comfirmKeyValue', async (req, res, next) => {
  try {
    const {
      datastoreId,
      dataIndex,
      keyIndex,
      value,
      t_cached,
      t_mined,
      transactionHash
    } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!dataIndex) throw new Error('Parameter reqired: dataIndex.')
    if (!keyIndex) throw new Error('Parameter reqired: keyIndex.')
    if (!value) throw new Error('Parameter reqired: value.')
    if (!t_cached) throw new Error('Parameter reqired: t_cached.')
    if (!t_mined) throw new Error('Parameter reqired: t_mined.')
    if (!transactionHash) throw new Error('Parameter reqired: transactionHash.')
    await DataStoreDAO.comfirmKeyValue(
      datastoreId,
      dataIndex,
      keyIndex,
      value,
      t_cached,
      t_mined,
      transactionHash
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/readDataEntryByDataIndex', async (req, res, next) => {
  try {
    const { datastoreId, dataIndexSkip, retrieveCount } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    const data = await DataStoreDAO.readDataEntryByDataIndex(
      datastoreId,
      dataIndexSkip,
      retrieveCount
    )
    res.send(data)
  } catch (error) {
    next(error)
  }
})

router.post('/readDataEntryWithFilter', async (req, res, next) => {
  try {
    const { datastoreId, filters } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    const data = await DataStoreDAO.readDataEntryByFilter(datastoreId, filters)
    res.send(data)
  } catch (error) {
    next(error)
  }
})

module.exports = router
