const c = require('ansi-colors')
const ObjectID = require('mongodb').ObjectID
const moment = require('moment')

const { mongoClient, redisClient } = require('../connection')

const datastoreCollection = mongoClient.db('bcc-data').collection('datastore')
const DatastoreNotFound = new Error('Datastore not found.')

// create datastore doc in db
// datastore doc stores meta data of a datastore, its schema (columns),
// underlying deployed contract and state of the datastore agent monitering
const writeDatastore = async (name, type, userId, chainId) => {
  const { insertedId } = await datastoreCollection.insertOne({
    name,
    type,
    createdOn: moment().unix(),
    userId,
    chainId,
    // id of the deployed contract, used for sending transactions
    contract: null,
    // datastore agent monitoring state, once its set by datastore agent
    // datastore agent will continusly sync the cached data
    monitoring: false,
    // column schema
    columns: {
      // columnName: { columnIndex, columnName, columnDataType}
    },
    // current data row count (include revoked)
    currentRowIndex: 0
  })
  return { datastoreId: insertedId.toHexString() }
}

// util function to get a row index and increase the count automaticly
const getRowIndex = async datastoreId => {
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $inc: { currentRowIndex: 1 } }
  )
  if (value === null) throw DatastoreNotFound
  return value.currentRowIndex
}

// read datastore doc
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

// read datastore docs by a list of ids
const readDatastoreList = async datastores => {
  const datastoreDocs = await datastoreCollection
    .find({
      _id: { $in: datastores.map(datastoreId => new ObjectID(datastoreId)) }
    })
    .toArray()
  const datastoreList = datastoreDocs.map(datastore => {
    datastore.datastoreId = datastore._id.toHexString()
    delete datastore._id
    return datastore
  })
  return datastoreList
}

// util function to delete a collection named by a datastore id, namely the data 
// row docs of a datastore
const deleteDataCollection = async datastoreId => {
  try {
    await mongoClient.db('bcc-data').dropCollection(datastoreId)
  } catch (error) {
    console.log(error.message)
    if(error.message !== "ns not found"){
      throw error
    }
  }
}

// delete the datastore doc
const deleteDatastore = async datastoreId => {
  const { value } = await datastoreCollection.findOneAndDelete({
    _id: new ObjectID(datastoreId)
  })
  if (value === null) throw DatastoreNotFound
  await deleteDataCollection(datastoreId)
}

// update the contract id of a datastore, used during datastore deploy
// after a datastore contract is deployed to a chain instance
const updateDatastoreContract = async (datastoreId, contractId) => {
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $set: { contract: contractId } }
  )
  if (value === null) throw DatastoreNotFound
}

// inform the monitoring redis queue, datastore agent monitoring this queue
// and will start monitoring a datastore contract event once it shows in queue
const publishDatastore = async (datastoreId, namespace) => {
  redisClient.publish(`CreateDatastore:${namespace}`, datastoreId)
}

// set the datastore agent monitoring state of a datastore, only when
// datastore agent starts monitoring, the deployment of a datastore can continue
const setMonitoring = async datastoreId => {
  // console.log('in dao: ' + datastoreId)
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    { $set: { monitoring: true } }
  )
  if (value === null) throw DatastoreNotFound
}

// call by datastore agent only to update the column
const appendColumn = async (
  datastoreId,
  columnIndex,
  columnName,
  columnDataType
) => {
  const { value } = await datastoreCollection.findOneAndUpdate(
    { _id: new ObjectID(datastoreId) },
    {
      $set: {
        [`columns.${columnName}`]: {
          columnIndex,
          columnName,
          columnDataType
        }
      }
    }
  )
  if (value === null) throw DatastoreNotFound
}

// data store data row ---------------------------------------------------------

// cache a data row 
const createDataRow = async (datastoreId) => {
  console.log(datastoreId)
  const datastore = await readDatastore(datastoreId)
  console.log(datastore)
  const rowIndex = await getRowIndex(datastoreId)
  // locate the datastore data row collection
  const collection = await mongoClient.db('bcc-data').collection(datastoreId)
  // insert data row as a doc
  const { insertedId } = await collection.insertOne({
    rowIndex,
    columns: {...datastore.columns},
    revoke: null
  })
  return { rowIndex }
}

// cache a data row revoke 
const cacheDataRowRevoke = async (datastoreId, rowIndex, actor) => {
  const collection = await mongoClient.db('bcc-data').collection(datastoreId)
  const { value } = await collection.findOneAndUpdate(
    { rowIndex: parseInt(rowIndex) },
    { $set: { revoke: { actor, t_cached: moment().unix() } } }
  )
  if (value === null) throw new Error('No data row found.')
}

// confirm a data row revoke op, same like confimrCreateDataRow,
const confirmDataRowRevoked = async (datastoreId, rowIndex, t_bc) => {
  const collection = await mongoClient.db('bcc-data').collection(datastoreId)
  const { value } = await collection.findOneAndUpdate(
    { rowIndex: parseInt(rowIndex) },
    { $set: { 'revoke.t_bc': parseInt(t_bc) } }
  )
  if (value === null) throw new Error('No data row found.')
}

const parseDataValue = (v, t)=>{
  switch (t) {
    case 'string':
      return v.toString();
    case 'integer':
      return parseInt(v)
    case 'number':
      return parseFloat(v)
    case 'boolean':
      if(v==='true'){
        return true
      }else{
        return false
      }
    default:
      throw new Error(`Unsupported data type: ${t}`);
  }
}

const cacheDataWrite = async (
  datastoreId,
  rowIndex,
  columnIndex,
  columnName,
  columnDataType,
  dataValue,
  actor
) => {
  const collection = await mongoClient.db('bcc-data').collection(datastoreId)
  let parsedDataValue = null
  try {
    parsedDataValue = parseDataValue(dataValue, columnDataType)
  } catch (error) {
    throw error
  }
  const { value } = await collection.findOneAndUpdate(
    { rowIndex: parseInt(rowIndex) },
    {
      $push: {
        [`columns.${columnName}.history`]: {
          value: parsedDataValue,
          actor,
          t_cached: moment().unix()
        }
      }
    },
    {returnOriginal: false}
  )
  if (value === null) throw new Error('No data row found.')
  return { historyIndex: value.columns[columnName].history.length - 1 }
}

const confirmDataWritten = async (
  datastoreId,
  rowIndex,
  columnName,
  historyIndex,
  t_bc
) => {
  const collection = await mongoClient.db('bcc-data').collection(datastoreId)
  const { value } = await collection.findOneAndUpdate(
    { rowIndex: parseInt(rowIndex) },
    {
      $set: {
        [`columns.${columnName}.history.${historyIndex}.t_bc`]: parseInt(t_bc)
      }
    }
  )
  if (value === null) throw new Error('No data row found.')
}

const readDataRow = async (
  datastoreId,
  rowIndexSkip,
  retrieveCount = 10
) => {
  // locate the collection
  const collection = mongoClient.db('bcc-data').collection(datastoreId)
  let docs = []
  let rowIndexList = []
  if (rowIndexSkip) {
    for (let i = rowIndexSkip; i < rowIndexSkip + retrieveCount; i++) {
      rowIndexList.push(i)
    }
  } else {
    rowIndexList = [...Array(retrieveCount).keys()]
  }
  console.log(
    c.gray(
      `Read data row by rowIndex: ${JSON.stringify(rowIndexList)}`
    )
  )
  docs = await collection
    .find({ rowIndex: { $in: rowIndexList } })
    .toArray()
  return docs
}

const readDataRowWithFilter = async (datastoreId, filter) => {
  const collection = mongoClient.db('bcc-data').collection(datastoreId)

  const filterList = Object.entries(filter).map(([columnName, filterValue])=>{
    return {
      [`columns.${columnName}.history`]: {$elemMatch: {value: filterValue} } 
    }
  })
  const filterObj = { $and: filterList}
  console.log(filterObj)
  const docs = await collection.find(filterObj).toArray()
  return docs
}

module.exports = {
  writeDatastore,
  readDatastore,
  readDatastoreList,
  deleteDataCollection,
  deleteDatastore,
  updateDatastoreContract,
  publishDatastore,
  setMonitoring,
  appendColumn,
  createDataRow,
  cacheDataRowRevoke,
  confirmDataRowRevoked,
  cacheDataWrite,
  confirmDataWritten,
  readDataRow,
  readDataRowWithFilter,
}
