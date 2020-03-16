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

router.post('/appendColumn', async (req, res, next) => {
  try {
    const { datastoreId, columnIndex, columnName, columnDataType } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (columnIndex === null || columnIndex === undefined) throw new Error('Parameter reqired: columnIndex.')
    if (!columnName) throw new Error('Parameter reqired: columnName.')
    if (!columnDataType) throw new Error('Parameter reqired: columnDataType.')
    await DataStoreDAO.appendColumn(
      datastoreId,
      columnIndex,
      columnName,
      columnDataType
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/createDataRow', async (req, res, next) => {
  try {
    const { datastoreId, actor } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    res.send(await DataStoreDAO.createDataRow(datastoreId, actor))
  } catch (error) {
    next(error)
  }
})

router.post('/cacheDataRowRevoke', async (req, res, next) => {
  try {
    const { datastoreId, rowIndex, actor } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (rowIndex === null || rowIndex === undefined) throw new Error('Parameter reqired: rowIndex.')
    // if (!actor) throw new Error('Parameter reqired: actor.')
    await DataStoreDAO.cacheDataRowRevoke(datastoreId, rowIndex, actor)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/confirmDataRowRevoked', async (req, res, next) => {
  try {
    const { datastoreId, rowIndex, t_bc } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!t_bc) throw new Error('Parameter reqired: t_bc.')
    await DataStoreDAO.confirmDataRowRevoked(datastoreId, rowIndex, t_bc)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/cacheDataWrite', async (req, res, next) => {
  try {
    const {
      datastoreId,
      rowIndex,
      columnIndex,
      columnName,
      columnDataType,
      dataValue,
      actor
    } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (rowIndex === null || rowIndex === undefined) throw new Error('Parameter reqired: rowIndex.')
    if (columnIndex === null || columnIndex === undefined) throw new Error('Parameter reqired: columnIndex.')
    if (!columnName) throw new Error('Parameter reqired: columnName.')
    if (!columnDataType) throw new Error('Parameter reqired: columnDataType.')
    if (dataValue === null || dataValue === undefined) throw new Error('Parameter reqired: dataValue.')
    // if (!actor) throw new Error('Parameter reqired: actor.')

    res.send(
      await DataStoreDAO.cacheDataWrite(
        datastoreId,
        rowIndex,
        columnIndex,
        columnName,
        columnDataType,
        dataValue,
        actor
      )
    )
  } catch (error) {
    next(error)
  }
})

router.post('/confirmDataWritten', async (req, res, next) => {
  try {
    const { datastoreId, rowIndex, columnName, historyIndex, t_bc } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (rowIndex === null || rowIndex === undefined) throw new Error('Parameter reqired: rowIndex.')
    if (!columnName) throw new Error('Parameter reqired: columnName.')
    if (historyIndex === null || historyIndex === undefined) throw new Error('Parameter reqired: historyIndex.')
    if (!t_bc) throw new Error('Parameter reqired: t_bc.')
    await DataStoreDAO.confirmDataWritten(
      datastoreId,
      rowIndex,
      columnName,
      historyIndex,
      t_bc
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/readDataRow', async (req, res, next) => {
  try {
    const { datastoreId, rowIndexSkip, retrieveCount } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (rowIndexSkip === null || rowIndexSkip === undefined)
      throw new Error('Parameter reqired: rowIndexSkip.')
    if (retrieveCount === null || retrieveCount === undefined)
      throw new Error('Parameter reqired: retrieveCount.')
    res.send(
      await DataStoreDAO.readDataRow(datastoreId, rowIndexSkip, retrieveCount)
    )
  } catch (error) {
    next(error)
  }
})

router.post('/readDataRowWithFilter', async (req, res, next) => {
  try {
    const { datastoreId, filter } = req.body
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    if (!filter) throw new Error('Parameter reqired: filter.')
    res.send(await DataStoreDAO.readDataRowWithFilter(datastoreId, filter))
  } catch (error) {
    next(error)
  }
})

// datastore data router -------------------------------------------------------

module.exports = router
