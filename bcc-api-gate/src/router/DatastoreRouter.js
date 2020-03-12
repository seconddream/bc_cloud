const { Router } = require('express')

const TaskControl = require('../control/TaskControl')
const DatastoreController = require('../control/DatastoreControl')


const router = new Router()

router.post(
  '/:userId/chain/:chainId/deployment/datastore',
  async (req, res, next) => {
    const { userId, chainId } = req.params
    const {name, type, schema} = req.body
    try {
      const { taskId } = await TaskControl.createDatastoreDeployTask(
        userId, chainId, name, type, schema
      )
      res.send({taskId})
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:userId/chain/:chainId/deployment/datastore',
  async (req, res, next) => {
    try {
      const {chainId} = req.params
      const datastores = await DatastoreController.getChainDatastoreList(chainId)
      res.send(datastores)
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:userId/chain/:chainId/deployment/datastore/:datastoreId',
  async (req, res, next) => {
    try {
      const {datastoreId} = req.params
      const datastore = await DatastoreController.getDatastore(datastoreId)
      res.send(datastore)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/chain/:chainId/deployment/datastore/:datastoreId',
  async (req, res, next) => {
    try {
      const {userId, chainId, datastoreId} = req.params
      await DatastoreController.deleteChainDatastore(userId, chainId, datastoreId)
      res.send()
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:userId/chain/:chainId/deployment/datastore/:datastoreId/schema',
  async (req, res, next) => {
    try {
      const {userId, chainId, datastoreId} = req.params
      const {schema} = req.body
      await DatastoreController.setChainDatastoreSchema(datastoreId, schema)
      res.send()
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:userId/datastore',
  async (req, res, next) => {
    try {
      const {userId} = req.params
      res.send(await DatastoreController.getUserDatastoreList(userId))
    } catch (error) {
      next(error)
    }
  }
)

router.get(
  '/:userId/datastore/:datastoreId',
  async (req, res, next) => {
    try {
      const {userId, datastoreId} = req.params
      res.send(await DatastoreController.getDatastore(datastoreId))
    } catch (error) {
      next(error)
    }
  }
)




module.exports = router
