import { APIGate } from './connection'

export const deployDatastoreToUserChain = async (
  userId,
  chainId,
  name,
  type,
  columns
) => {
  return await APIGate.post(
    `/user/${userId}/chain/${chainId}/deployment/datastore`,
    {
      userId,
      chainId,
      name,
      type,
      columns
    }
  )
}

export const getUserChainDatastoreList = async (userId, chainId) => {
  return await APIGate.get(
    `/user/${userId}/chain/${chainId}/deployment/datastore`
  )
}

export const getUserDatastoreList = async userId => {
  return await APIGate.get(`/user/${userId}/datastore`)
}

export const getUserChainDatastore = async (userId, chainId, datastoreId) => {
  return await APIGate.get(
    `/user/${userId}/chain/${chainId}/deployment/datastore/${datastoreId}`
  )
}

export const getUserDatastore = async (userId, datastoreId) => {
  return await APIGate.get(`/user/${userId}/datastore/${datastoreId}`)
}

export const deleteUserChainDatastore = async (
  userId,
  chainId,
  datastoreId
) => {
  return await APIGate.delete(
    `/user/${userId}/chain/${chainId}/deployment/datastore/${datastoreId}`
  )
}

export const updateDatastoreSchema = async (
  userId,
  chainId,
  datastoreId,
  keys = [],
  keyDataTypes = []
) => {
  const schema = {}
  keys.forEach((keyName, keyIndex) => {
    if (!schema[keyIndex]) schema[keyIndex] = {}
    schema[keyIndex].keyName = keyName
    schema[keyIndex].dataType = keyDataTypes[keyIndex]
  })
  console.log(schema)
  await APIGate.put(
    `/user/${userId}/chain/${chainId}/deployment/datastore/${datastoreId}/schema`,
    { datastoreId, schema }
  )
}

export const createDatastoreDataEntries = async (datastoreId, dataEntries) => {
  await APIGate.post(`/datastore/${datastoreId}/data`, {
    dataEntries
  })
}

export const getDatastoreData = async (
  datastoreId,
  rowIndexSkip = 0,
  retrieveCount = 10,
  filters = null
) => {
  return await APIGate.post(`/datastore/${datastoreId}/read`, {
    rowIndexSkip,
    retrieveCount,
    filters
  })
}

export const writeDataStoreDataRow = async (datastoreId, contractId, row) => {
  return await APIGate.post(`/datastore/${datastoreId}/${contractId}/row`, {
    row
  })
}

export const updateDataStoreDataValue = async (
  datastoreId,
  contractId,
  rowIndex,
  columnIndex,
  columnName,
  columnDataType,
  dataValue
) => {
  return await APIGate.put(
    `/datastore/${datastoreId}/${contractId}/data/${rowIndex}/${columnIndex}/dataValue`,
    {
      contractId,
      columnName,
      columnIndex,
      columnDataType,
      dataValue
    }
  )
}

export const revokeDatastoreDataRow = async (
  datastoreId,
  contractId,
  rowIndex
)=>{
  return await APIGate.delete(
    `/datastore/${datastoreId}/${contractId}/data/${rowIndex}`
  )
}
