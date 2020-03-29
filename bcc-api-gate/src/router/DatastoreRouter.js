const { Router } = require('express')

const TaskControl = require('../control/TaskControl')
const DatastoreController = require('../control/DatastoreControl')
const AccessControl = require('../control/AccessControl')


const router = new Router()

// deploy datastore
router.post(
  '/:userId/chain/:chainId/deployment/datastore',
  async (req, res, next) => {
    const { userId, chainId } = req.params
    const { name, type, columns } = req.body
    try {
      const { taskId } = await TaskControl.createDatastoreDeployTask(
        userId,
        chainId,
        name,
        type,
        columns
      )
      res.send({ taskId })
    } catch (error) {
      next(error)
    }
  }
)

// read datastore list of a chain
router.get(
  '/:userId/chain/:chainId/deployment/datastore',
  async (req, res, next) => {
    try {
      const { chainId } = req.params
      const datastores = await DatastoreController.getChainDatastoreList(
        chainId
      )
      res.send(datastores)
    } catch (error) {
      next(error)
    }
  }
)

// read datastore by id
router.get(
  '/:userId/chain/:chainId/deployment/datastore/:datastoreId',
  async (req, res, next) => {
    try {
      const { datastoreId } = req.params
      const datastore = await DatastoreController.getDatastore(datastoreId)
      res.send(datastore)
    } catch (error) {
      next(error)
    }
  }
)

// delete datastore by id
router.delete(
  '/:userId/chain/:chainId/deployment/datastore/:datastoreId',
  async (req, res, next) => {
    try {
      const { userId, chainId, datastoreId } = req.params
      await DatastoreController.deleteChainDatastore(
        userId,
        chainId,
        datastoreId
      )
      res.send()
    } catch (error) {
      next(error)
    }
  }
)

// get user datastores
router.get('/:userId/datastore', async (req, res, next) => {
  try {
    const { userId } = req.params
    res.send(await DatastoreController.getUserDatastoreList(userId))
  } catch (error) {
    next(error)
  }
})

// get user datastore by id
router.get('/:userId/datastore/:datastoreId', async (req, res, next) => {
  try {
    const { userId, datastoreId } = req.params
    res.send(await DatastoreController.getDatastore(datastoreId))
  } catch (error) {
    next(error)
  }
})


router.get('/:userId/datastore/:datastoreId/access', async (req, res, next) => {
  try {
    const { datastoreId } = req.params
    res.send(await AccessControl.readAccess(datastoreId))
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:userId/datastore/:datastoreId/access/readWhiteList',
  async (req, res, next) => {
    try {
      const { datastoreId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(datastoreId, actor, [
        'readWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/datastore/:datastoreId/access/readWhiteList/:actor',
  async (req, res, next) => {
    try {
      const { datastoreId, actor } = req.params
      await AccessControl.removeActorFromList(datastoreId, actor, [
        'readWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:userId/datastore/:datastoreId/access/writeWhiteList',
  async (req, res, next) => {
    try {
      const { datastoreId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(datastoreId, actor, [
        'writeWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/datastore/:datastoreId/access/writeWhiteList/:actor',
  async (req, res, next) => {
    try {
      const { datastoreId, actor } = req.params
      await AccessControl.removeActorFromList(datastoreId, actor, [
        'writeWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:userId/datastore/:datastoreId/access/blackList',
  async (req, res, next) => {
    try {
      const { datastoreId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(datastoreId, actor, ['blackList'])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/datastore/:datastoreId/access/blackList/:actor',
  async (req, res, next) => {
    try {
      const { datastoreId, actor } = req.params
      await AccessControl.removeActorFromList(datastoreId, actor, ['blackList'])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)


module.exports = router
