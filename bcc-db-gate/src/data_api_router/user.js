const { Router } = require('express')
const UserDAO = require('../data_dao/user')

const router = new Router()

router.post('/writeUser', async (req, res, next) => {
  try {
    const { email, accountAddr, keystore } = req.body
    res.send(await UserDAO.writeUser(email, accountAddr, keystore))
  } catch (error) {
    next(error)
  }
})

router.post('/readUserById', async (req, res, next) => {
  try {
    const { userId } = req.body
    res.send(await UserDAO.readUserById(userId))
  } catch (error) {
    next(error)
  }
})

router.post('/readUserByEmail', async (req, res, next) => {
  try {
    const { email } = req.body
    res.send(await UserDAO.readUserByEmail(email))
  } catch (error) {
    next(error)
  }
})

router.post('/readUserByAccountAddr', async (req, res, next) => {
  try {
    const { accountAddr } = req.body
    res.send(await UserDAO.readUserByAccountAddr(accountAddr))
  } catch (error) {
    next(error)
  }
})

router.post('/deleteUser', async (req, res, next) => {
  try {
    const { userId } = req.body
    await UserDAO.deleteUser(userId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendChain', async (req, res, next) => {
  try {
    const { userId, chainId } = req.body
    await UserDAO.appendChain(userId, chainId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeChain', async (req, res, next) => {
  try {
    const { userId, chainId } = req.body
    await UserDAO.removeChain(userId, chainId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendTask', async (req, res, next) => {
  try {
    const { userId, taskId} = req.body
    await UserDAO.appendTask(userId, taskId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeTask', async (req, res, next) => {
  try {
    const {userId, taskId} = req.body
    await UserDAO.removeTask(userId, taskId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendProject', async (req, res, next) => {
  try {
    const {userId, projectId} = req.body
    await UserDAO.appendProject(userId, projectId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeProject', async (req, res, next) => {
  try {
    const {userId, projectId} = req.body
    await UserDAO.removeProject(userId, projectId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendService', async (req, res, next) => {
  try {
    const {userId, serviceId} = req.body
    await UserDAO.appendService(userId, serviceId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeService', async (req, res, next) => {
  try {
    const {userId, serviceId} = req.body
    await UserDAO.removeService(userId, serviceId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendDatastore', async (req, res, next) => {
  try {
    const {userId, datastoreId} = req.body
    await UserDAO.appendDatastore(userId, datastoreId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeDatastore', async (req, res, next) => {
  try {
    const {userId, datastoreId} = req.body
    await UserDAO.removeDatastores(userId, datastoreId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/refreshUserToken', async (req, res, next) => {
  try {
    const {userId} = req.body
    res.send(await UserDAO.refreshUserToken(userId))
  } catch (error) {
    next(error)
  }
})

router.post('/readUserToken', async (req, res, next) => {
  try {
    const {userId} = req.body
    res.send(await UserDAO.readUserToken(userId))
  } catch (error) {
    next(error)
  }
})

module.exports = router
