const { Router } = require('express')
const TaskDAO = require('../data_dao/task')

const router = new Router()

router.post('/writeTask', async (req, res, next) => {
  try {
    const { userId, type, name, params } = req.body
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!type) throw new Error('Parameter reqired: type.')
    if (!name) throw new Error('Parameter reqired: name.')
    if (!params) throw new Error('Parameter reqired: params.')
    res.send(await TaskDAO.writeTask(userId, type, name, params))
  } catch (error) {
    next(error)
  }
})

router.post('/readTask', async (req, res, next) => {
  try {
    const { taskId } = req.body
    if (!taskId) throw new Error('Parameter reqired: taskId.')
    res.send(await TaskDAO.readTask(taskId))
  } catch (error) {
    next(error)
  }
})

router.post('/appendLog', async (req, res, next) => {
  try {
    const { taskId, type, timestamp, message } = req.body
    if (!taskId) throw new Error('Parameter reqired: taskId.')
    if (!type) throw new Error('Parameter reqired: type.')
    if (!timestamp) throw new Error('Parameter reqired: timestamp.')
    if (!message) throw new Error('Parameter reqired: message.')
    await TaskDAO.appendLog(taskId, type, timestamp, message)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateStatus', async (req, res, next) => {
  try {
    const { taskId, status } = req.body
    if (!taskId) throw new Error('Parameter reqired: taskId.')
    if (!status) throw new Error('Parameter reqired: status.')
    await TaskDAO.updateStatus(taskId, status)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/getOneTaskFromQueue', async (req, res, next) => {
  try {
    const taskId = await TaskDAO.getOneTaskFromQueue()
    if(taskId === null){
      res.send('NO_TASK')
    }else{
      const task = await TaskDAO.readTask(taskId)
      res.send(task)
    }
  } catch (error) {
    next(error)
  }
})

router.post('/publishTask', async (req, res, next) => {
  try {
    const { taskId } = req.body
    if (!taskId) throw new Error('Parameter reqired: taskId.')
    await TaskDAO.publishTask(taskId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

module.exports = router
