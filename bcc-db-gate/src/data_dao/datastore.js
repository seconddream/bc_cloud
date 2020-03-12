const c = require('ansi-colors')
const ObjectID = require('mongodb').ObjectID
const moment = require('moment')

const { mongoClient, redisClient } = require('../connection')

const datastoreCollection = mongoClient.db('bcc-data').collection('datastore')
const DatastoreNotFound = new Error('Datastore not found.')

const writeDatastore = async (name, type, userId, chainId) => {
  const { insertedId } = await datastoreCollection.insertOne({
    name,
    type,
    createdOn: moment().valueOf(),
    userId,
    chainId,
    contract: null,
    monitoring: false,
    keys: [],
    keyDataTypes: [],
    revokedDataIndex: [],
    dataCount: 0
  })
  return { datastoreId: insertedId.toHexString() }
}

const readDatastore = async datastoreId => {
  const doc = await datastoreCollection
    .find({ _id: new ObjectID(datastoreId) })
    .toArray()
  if (doc.length === 0) throw DatastoreNotFound
  const datastore = doc[0]
  datastore.datastoreId = datastoreId
  delete datastore._id
  return datastore
}

const readDatastoreList = async datastores => {
  const datastoreDocs = await datastoreCollection
    .find({
      _id: { $in: datastores.map(datastoreId => new ObjectID(datastoreId)) }
    })
    .toArray()
  const datastoreList =  datastoreDocs.map(datastore => {
    datastore.datastoreId = datastore._id.toHexString()
    delete datastore._id
    return datastore
  })
  return datastoreList
}

const deleteDataCollection = async datastoreId => {
  const resp = await mongoClient.db('bcc-data').dropCollection(datastoreId)
  console.log(resp)
}


const deleteDatastore = async datastoreId => {
  const { value } = await datastoreCollection.findOneAndDelete({
    _id: new ObjectID(datastoreId)
  })
  if (value === null) throw DatastoreNotFound
  await deleteDataCollection(datastoreId)
}

const updateDatastoreContract = async (datastoreId, contractId) => {
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $set: { contract: contractId } }
  )
  if (value === null) throw DatastoreNotFound
}

const publishDatastore = async (datastoreId, namespace) => {
  redisClient.publish(`CreateDatastore:${namespace}`, datastoreId)
}

const setMonitoring = async datastoreId => {
  // console.log('in dao: ' + datastoreId)
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $set: { monitoring: true } }
  )
  if (value === null) throw DatastoreNotFound
}

const setSchema = async (datastoreId, schema) => {
  const keys = []
  const keyDataTypes = []

  for (const keyId of Object.keys(schema).sort((a, b) => a - b)) {
    keys.push(schema[keyId].keyName)
    keyDataTypes.push(schema[keyId].dataType)
  }
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $set: { keys, keyDataTypes } }
  )
  if (value === null) throw DatastoreNotFound
}

const cacheRevokeDataEntry = async (
  datastoreId,
  dataIndex,
  t_cached,
  caller
) => {
  const { revokedDataIndex } = await readDatastore(datastoreId)
  if (revokedDataIndex.filter(r => dataIndex === dataIndex).length > 0)
    throw new Error('DataIndex already revoked.')
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $push: { revokedDataIndex: { dataIndex, t_cached, caller } } }
  )
  if (value === null) throw DatastoreNotFound
  console.log(c.gray('cache revoke data entry, indexes after: '))
  console.log(c.gray(JSON.stringify(value.revokedDataIndex)))
}

const comfirmRevokeDataEntry = async (
  datastoreId,
  dataIndex,
  t_cached,
  t_mined,
  transactionHash
) => {
  const { revokedDataIndex } = await readDatastore(datastoreId)
  console.log(c.gray('comfirm revoke data entry, indexes before: '))
  console.log(c.gray(JSON.stringify(revokedDataIndex)))
  const recordList = revokedDataIndex.filter(
    r => r.dataIndex === dataIndex && r.t_cached === t_cached
  )
  if (recordList.length === 0) throw new Error('No revoke record found.')
  const record = { ...recordList[0], t_mined, transactionHash }
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    {
      $pull: { revokedDataIndex: { dataIndex, t_cached } },
      $push: { revokedDataIndex: record }
    },
    { returnOriginal: false }
  )

  console.log(c.gray('comfirm revoke data entry, indexes after: '))
  console.log(c.gray(JSON.stringify(value.revokedDataIndex)))
}

// data store data -----------------------------------------------------------

const parseDataValue = (value, type) => {
  switch (type) {
    case 'string':
      return value
    case 'integer':
      return parseInt(value)
    case 'float':
      return parseFloat(value)
    case 'bool':
      return value === 'true' ? true : false
    default:
      return value
  }
}

const parseDataDocs = async (datastoreId, dataDocs) => {
  const { keys, keyDataTypes } = await readDatastore(datastoreId)
  const data = {}
  for (const dataDoc of dataDocs) {
    const { dataIndex, keyIndex } = dataDoc
    if (!data[dataIndex]) data[dataIndex] = {}
    data[dataIndex][keys[keyIndex]] = { ...dataDoc }
    data[dataIndex][keys[keyIndex]].value = parseDataValue(
      data[dataIndex][keys[keyIndex]].value,
      keyDataTypes[keyIndex]
    )
  }
  return data
}

const getNextDataIndex = async datastoreId => {
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $inc: { dataCount: 1 } }
  )
  if (value === null) throw DatastoreNotFound
  return { dataIndex: value.dataCount }
}

const createDataEntry = async (datastoreId, dataIndex, keyCount) => {
  // locate the collection
  const collection = await mongoClient.db('bcc-data').collection(datastoreId)
  // test for dataIndex already used
  const existDocs = await collection.find({ dataIndex }).toArray()
  if (existDocs.length > 0) throw new Error(`DataIndex ${dataIndex} exist.`)
  // insert data doc for each key of the data entry
  const resp = await collection.insertMany(
    [...Array(keyCount).keys()].map(keyIndex => {
      return {
        dataIndex,
        keyIndex,
        value: null,
        history: []
      }
    })
  )
  console.log(resp)
}

// used by API Gate
// for all new incoming key value pair of a data entry before mined on the chain
const cacheKeyValue = async (
  datastoreId,
  dataIndex,
  keyIndex,
  value,
  t_cached,
  caller
) => {
  const { revokedDataIndex } = await readDatastore(datastoreId)
  if (revokedDataIndex.map(o => o.dataIndex).includes(dataIndex))
    throw new Error('DataIndex revoked.')
  // locate the collection
  const collection = mongoClient.db('bcc-data').collection(datastoreId)
  // update value of the key, sync to false, because it is not mined yet
  const resp = await collection.findOneAndUpdate(
    { dataIndex, keyIndex },
    { $push: { history: { value, t_cached, caller } } }
  )
  if (resp.value === null)
    throw new Error(
      `DataIndex ${dataIndex} and keyIndex ${keyIndex} does not exist.`
    )
}

// used by datastore agent
// for the comfirm after key value pair is mined
const comfirmKeyValue = async (
  datastoreId,
  dataIndex,
  keyIndex,
  value,
  t_cached,
  t_mined,
  transactionHash
) => {
  const { revokedDataIndex } = await readDatastore(datastoreId)
  if (revokedDataIndex.map(o => o.dataIndex).includes(dataIndex))
    throw new Error('DataIndex revoked.')
  // locate the collection
  const collection = mongoClient.db('bcc-data').collection(datastoreId)
  // read the doc with dataIndex and keyIndex
  const dataDocs = await collection.find({ dataIndex, keyIndex }).toArray()
  if (dataDocs.length === 0)
    throw new Error(
      `DataIndex ${dataIndex} and keyIndex ${keyIndex} does not exist.`
    )
  console.log(c.gray(`DataDoc[${dataIndex}][${keyIndex}] before comfirm:`))
  console.log(c.gray(JSON.stringify(dataDocs[0])))
  // update record
  const recordList = dataDocs[0].history.filter(r => r.t_cached === t_cached)
  if (recordList.length === 0) throw new Error('No history record found.')
  if (recordList.length > 1) throw new Error('Duplicated records found.')
  const record = { ...recordList[0], value, t_mined, transactionHash }
  // update doc
  await collection.findOneAndUpdate(
    { dataIndex, keyIndex },
    { $set: { value }, $pull: { history: { t_cached } } }
  )
  const resp = await collection.findOneAndUpdate(
    { dataIndex, keyIndex },
    { $set: { value }, $push: { history: record } },
    { returnOriginal: false }
  )
  console.log(c.gray(`DataDoc[${dataIndex}][${keyIndex}] after comfirm:`))
  console.log(c.gray(JSON.stringify(resp.value)))
}

const readDataEntryByDataIndex = async (
  datastoreId,
  dataIndexSkip,
  retrieveCount = 10
) => {
  // locate the collection
  const collection = mongoClient.db('bcc-data').collection(datastoreId)
  let docs = []
  if (dataIndexSkip) {
    const dataIndexList = []
    for (let i = dataIndexSkip; i < dataIndexSkip + retrieveCount; i++) {
      dataIndexList.push(i)
    }
    console.log(
      c.gray(
        `Read data entry by data indexes: ${JSON.stringify(dataIndexList)}`
      )
    )
    docs = await collection
      .find({ dataIndex: { $in: dataIndexList } })
      .toArray()
  } else {
    const dataIndexList = [...Array(retrieveCount).keys()]
    console.log(
      c.gray(
        `Read data entry by data indexes: ${JSON.stringify(dataIndexList)}`
      )
    )
    docs = await collection
      .find({ dataIndex: { $in: dataIndexList } })
      .toArray()
  }

  return parseDataDocs(datastoreId, docs)
}

const readDataEntryByFilter = async (datastoreId, filter) => {
  const collection = mongoClient.db('bcc-data').collection(datastoreId)
  const docs = await collection.find({ ...filter }).toArray()
  return parseDataDocs(datastoreId, docs)
}


module.exports = {
  writeDatastore,
  readDatastore,
  readDatastoreList,
  deleteDatastore,
  updateDatastoreContract,
  publishDatastore,
  setMonitoring,
  setSchema,
  cacheRevokeDataEntry,
  comfirmRevokeDataEntry,
  getNextDataIndex,
  createDataEntry,
  cacheKeyValue,
  comfirmKeyValue,
  readDataEntryByDataIndex,
  readDataEntryByFilter,
  deleteDataCollection
}
