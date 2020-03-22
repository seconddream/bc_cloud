const { Router } = require('express')
const DatastoreCallControl = require('../control/DatastoreCallControl')
const DatastoreControl = require('../control/DatastoreControl')
const ContracControl = require('../control/ContractControl')

const router = new Router()

// write new
router.post('/:datastoreId/:contractId/row', async (req, res, next) => {
  try {
    const { datastoreId, contractId } = req.params
    const { row, actor } = req.body
    res.send(
      await DatastoreCallControl.writeRow(datastoreId, contractId, row, actor)
    )
  } catch (error) {
    next(error)
  }
})

// revoke data row
router.delete(
  '/:datastoreId/:contractId/data/:rowIndex',
  async (req, res, next) => {
    try {
      const { datastoreId, rowIndex, contractId } = req.params
      const { actor } = req.body
      console.log(req.body)
      await DatastoreCallControl.revokeRow(
        datastoreId,
        contractId,
        rowIndex,
        actor
      )
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:datastoreId/:contractId/data/:rowIndex/:columnIndex/dataValue',
  async (req, res, next) => {
    try {
      const { datastoreId, contractId, rowIndex, columnIndex } = req.params
      const { columnName, columnDataType, dataValue, actor } = req.body
      await DatastoreCallControl.updateColumn(
        datastoreId,
        contractId,
        rowIndex,
        columnIndex,
        columnName,
        columnDataType,
        dataValue,
        actor
      )
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.post('/:datastoreId/read', async (req, res, next) => {
  try {
    const { datastoreId } = req.params
    const { rowIndexSkip, retrieveCount, filters } = req.body
    if (filters) {
      res.send(
        await DatastoreCallControl.readRowsWithFilter(datastoreId, filters)
      )
    } else {
      res.send(
        await DatastoreCallControl.readRows(
          datastoreId,
          rowIndexSkip,
          retrieveCount
        )
      )
    }
  } catch (error) {
    next(error)
  }
})

module.exports = router
