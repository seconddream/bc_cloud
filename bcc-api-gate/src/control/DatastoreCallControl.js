const moment = require('moment')
const { callDBGate, callTransactionGate } = require('../connection')

const updateColumn = async (
  datastoreId,
  contractId,
  rowIndex,
  columnIndex,
  columnName,
  columnDataType,
  dataValue,
  actor
) => {
  const { historyIndex } = await callDBGate('/datastore/cacheDataWrite', {
    datastoreId,
    rowIndex,
    columnIndex,
    columnName,
    columnDataType,
    dataValue,
    actor
  })
  await callTransactionGate(`/fireContractMethod/${contractId}/writeData`, {
    callArgs: [rowIndex, columnIndex, dataValue, historyIndex]
  })
}

const writeRow = async (datastoreId, contractId, row, actor) => {
  // get a row index
  const { rowIndex } = await callDBGate('/datastore/createDataRow', {
    datastoreId,
    actor
  })
  // update columns in the row
  for (const [columnName, column] of Object.entries(row)) {
    const { columnIndex, columnDataType, dataValue } = column
    await updateColumn(
      datastoreId,
      contractId,
      rowIndex,
      columnIndex,
      columnName,
      columnDataType,
      dataValue,
      actor
    )
  }
  return { rowIndex }
}

const revokeRow = async (datastoreId, contractId, rowIndex, actor) => {
  await callDBGate('/datastore/cacheDataRowRevoke', {
    datastoreId,
    rowIndex,
    actor
  })
  await callTransactionGate(
    `/fireContractMethod/${contractId}/revokeDataRow`,
    {
      callArgs: [rowIndex]
    }
  )
}

const readRows = async (datastoreId, rowIndexSkip, retrieveCount) => {
  return await callDBGate('/datastore/readDataRow', {
    datastoreId,
    rowIndexSkip,
    retrieveCount
  })
}
const readRowsWithFilter = async (datastoreId, filter) => {
  return await callDBGate('/datastore/readDataRowWithFilter', {
    datastoreId,
    filter
  })
}

module.exports = {
  updateColumn,
  writeRow,
  revokeRow,
  readRows,
  readRowsWithFilter
}
