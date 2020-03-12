const { Router } = require('express')

const UserControl = require('../control/UserControl')
const TaskControl = require('../control/TaskControl')

const router = new Router()

router.get('/:userId/task', async (req, res, next) => {
  try {
    const { userId } = req.params
    const taskList = await TaskControl.getUserTaskList(userId)
    res.send(taskList)
  } catch (error) {
    next(error)
  }
})

router.get('/:userId/task/:taskId', async (req, res, next) => {
  try {
    const { taskId } = req.params
    const task = await TaskControl.getTask(taskId)
    res.send(task)
  } catch (error) {
    next(error)
  }
})

module.exports = router
