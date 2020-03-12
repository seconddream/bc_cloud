const { Router } = require('express')
const DatastoreCallControl = require('../control/DatastoreCallControl')

const router = new Router()

router.post('/:datastoreId/data', async (req, res, next) => {
  try {
    const { datastoreId } = req.params
    const { dataEntries, caller } = req.body
    await DatastoreCallControl.createDataEntries(
      datastoreId,
      dataEntries,
      caller
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.delete('/:datastoreId/data/:dataIndex', async (req, res, next) => {
  try {
    const { datastoreId, dataIndex } = req.params
    const { caller } = req.body
    await DatastoreCallControl.revokeDataEntry(datastoreId, dataIndex, caller)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:datastoreId/data/:dataIndex/:keyIndex',
  async (req, res, next) => {
    try {
      const { datastoreId, dataIndex, keyIndex } = req.params
      const { value, caller } = req.body
      await DatastoreCallControl.changeDataEntryKeyValue(
        datastoreId,
        dataIndex,
        keyIndex,
        value,
        caller
      )
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.post('/:datastoreId/readData', async (req, res, next) => {
  try {
    const { datastoreId } = req.params
    const { dataIndexSkip, retrieveCount, filters } = req.body
    if (filters) {
      res.send(
        await DatastoreCallControl.readDataEntryByWithFilter(
          datastoreId,
          filters
        )
      )
    } else {
      res.send(
        await DatastoreCallControl.readDataEntryByDataIndex(
          datastoreId,
          dataIndexSkip,
          retrieveCount
        )
      )
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
