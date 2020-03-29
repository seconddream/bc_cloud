const c = require('ansi-colors')
const ObjectID = require('mongodb').ObjectID
const { mongoClient } = require('../connection')

const accessCollection = mongoClient.db('bcc-data').collection('access')

const AccessExistForParentError = new Error(
  'Access rule exist for the parent id'
)
const AccessNotFoundError = new Error('Access rule not found')
const ActorExistInList = new Error('Actor already in list')
const ActorNotExistInList = new Error('Actor not found in list')

const readAccess = async parentId => {
  const accessDoc = await accessCollection.find({ parentId }).toArray()
  if (accessDoc.length === 0) throw AccessNotFoundError
  const access = accessDoc[0]
  delete access._id
  return access
}

const writeAccess = async parentId => {
  
  const accessDoc = await accessCollection.find({parentId}).toArray()
  if(accessDoc.length > 0) throw AccessExistForParentError

  await accessCollection.insertOne({
    parentId,
    readWhiteList: [],
    writeWhiteList: [],
    blackList: []
  })

}

const appendActorToList = async (parentId, actor, listNames = []) => {
  const access = await readAccess(parentId)
  const updateObj = {}
  for (const listName of listNames) {
    if (access[listName].includes(actor)) throw ActorExistInList
    updateObj[listName] = actor
  }
  console.log(updateObj)
  const { value } = await accessCollection.findOneAndUpdate(
    { parentId },
    { $push: { ...updateObj } }
  )
  if (value === null) throw AccessNotFoundError
}

const removeActorFromList = async (parentId, actor, listNames = []) => {
  const access = await readAccess(parentId)
  const updateObj = {}
  for (const listName of listNames) {
    if (!access[listName].includes(actor)) throw ActorNotExistInList
    updateObj[listName] = actor
  }
  console.log(updateObj)
  const { value } = await accessCollection.findOneAndUpdate(
    { parentId },
    { $pull: { ...updateObj } }
  )
  if (value === null) throw AccessNotFoundError
}

const deleteAccess = async(parentId) => {
  const { value } = await accessCollection.findOneAndDelete({
    parentId
  })
  if (value === null) throw AccessNotFoundError
}

module.exports = {
  readAccess,
  writeAccess,
  appendActorToList,
  removeActorFromList,
  deleteAccess,
}
