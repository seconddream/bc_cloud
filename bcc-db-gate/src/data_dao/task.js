const c = require('ansi-colors')
const ObjectID = require('mongodb').ObjectID
const { redisClient, mongoClient } = require('../connection')
const moment = require('moment')

const taskCollection = mongoClient.db('bcc-data').collection('task')

// write task
const writeTask = async (userId, type, name, params) => {
  const { insertedId } = await taskCollection.insertOne({
    userId,
    type,
    name,
    params,
    status: 'Created',
    logs: [
      { timestamp: moment().valueOf(), type: 'INFO', message: 'Task created.' }
    ]
  })
  const task = {
    taskId: insertedId.toHexString()
  }
  return task
}

// read task by id
const readTask = async taskId => {
  const taskDocs = await taskCollection
    .find({ _id: new ObjectID(taskId) })
    .toArray()
  if (taskDocs.length === 0) {
    throw new Error('Task not found.')
  }
  const task = taskDocs[0]
  delete task._id
  task.taskId = taskId
  return task
}

// read task by a list of task id
const readTaskList = async tasks => {
  const taskDocs = await taskCollection
    .find({ _id: { $in: tasks.map(taskId => new ObjectID(taskId)) } })
    .project({ name: 1, type: 1 })
    .toArray()
  return taskDocs.map(task => {
    const { _id, name, type, status } = task
    return { taskId: _id.toHexString(), name, type, status }
  })
}


// append log to task
const appendLog = async (taskId, type, timestamp, message) => {
  const { value } = await taskCollection.findOneAndUpdate(
    { _id: new ObjectID(taskId) },
    { $push: { logs: { timestamp, type, message } } }
  )
  if (value === null) throw new Error('Task not found.')
}

// update task status
const updateStatus = async (taskId, status) => {
  const { value } = await taskCollection.findOneAndUpdate(
    { _id: new ObjectID(taskId) },
    { $set: { status } }
  )
  if (value === null) throw new Error('Task not found.')
}

// helper to read current task queue
const getTaskQueue = async () => {
  return await redisClient.lrangeAsync('taskqueue:', 0, -1)
}

// retrive one task id from queue
const getOneTaskFromQueue = async ()=>{
  return await redisClient.lpopAsync('taskqueue:')
}

// publish task to redis queue
const publishTask = async taskId => {
  await redisClient.rpushAsync('taskqueue:', taskId)
  console.log(c.gray('current taskqueue: ' + (await getTaskQueue())))
}

module.exports = {
  writeTask,
  readTask,
  readTaskList,
  appendLog,
  updateStatus,
  getOneTaskFromQueue,
  publishTask,
}
