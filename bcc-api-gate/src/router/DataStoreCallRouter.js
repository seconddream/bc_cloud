const { Router } = require('express')
const DatastoreCallControl = require('../control/DatastoreCallControl')
const DatastoreControl = require('../control/DatastoreControl')
const ContracControl = require('../control/ContractControl')

const router = new Router()

// write new
router.post('/:datastoreId/row', async (req, res, next) => {
  try {
    const { datastoreId } = req.params
    const { contractId, row, actor } = req.body
    res.send(
      await DatastoreCallControl.writeRow(
        datastoreId,
        contractId,
        row,
        actor
      )
    )
  } catch (error) {
    next(error)
  }
})

// revoke data row
router.delete('/:datastoreId/data/:rowIndex', async (req, res, next) => {
  try {
    const { datastoreId, rowIndex } = req.params
    const { contractAddress, actor } = req.body
    await DatastoreCallControl.revokeRow(
      datastoreId,
      contractAddress,
      rowIndex,
      actor
    )
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:datastoreId/data/:rowIndex/:columnIndex',
  async (req, res, next) => {
    try {
      const {
        datastoreId,
        rowIndex,
        columnIndex,
      } = req.params
      const { columnName, columnDataType, dataValue, actor } = req.body
      await DatastoreCallControl.updateColumn(
        datastoreId,
        contractAddress,
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
    const { rowIndexSkip, retrieveCount, filter} = req.body
    if (filter) {
      res.send(
        await DatastoreCallControl.readRowsWithFilter(
          datastoreId,
          filters
        )
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
