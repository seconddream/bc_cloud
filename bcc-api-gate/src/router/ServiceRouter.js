const { Router } = require('express')

const ServiceControl = require('../control/ServiceControl')
const AccessControl = require('../control/AccessControl')

const router = new Router()

router.post('/:userId/service', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { name, type, config } = req.body
    const { serviceId } = await ServiceControl.createService(
      userId,
      name,
      type,
      config
    )
    res.send({ serviceId })
  } catch (error) {
    next(error)
  }
})

router.get('/:userId/service', async (req, res, next) => {
  try {
    const { userId } = req.params
    const serviceList = await ServiceControl.getUserServiceList(userId)
    res.send(serviceList)
  } catch (error) {
    next(error)
  }
})

router.get('/:userId/service/:serviceId', async (req, res, next) => {
  try {
    const { serviceId } = req.params
    const service = await ServiceControl.getService(serviceId)
    res.send(service)
  } catch (error) {
    next(error)
  }
})

router.delete('/:userId/service/:serviceId', async (req, res, next) => {
  try {
    const { userId, serviceId } = req.params
    await ServiceControl.deleteService(userId, serviceId)
    res.send()
  } catch (error) {
    next(error)
  }
})

router.get('/:userId/service/:serviceId/access', async (req, res, next) => {
  try {
    const { serviceId } = req.params
    res.send(await AccessControl.readAccess(serviceId))
  } catch (error) {
    next(error)
  }
})

router.put(
  '/:userId/service/:serviceId/access/readWhiteList',
  async (req, res, next) => {
    try {
      const { serviceId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(serviceId, actor, [
        'readWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/service/:serviceId/access/readWhiteList/:actor',
  async (req, res, next) => {
    try {
      const { serviceId, actor } = req.params
      await AccessControl.removeActorFromList(serviceId, actor, [
        'readWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:userId/service/:serviceId/access/writeWhiteList',
  async (req, res, next) => {
    try {
      const { serviceId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(serviceId, actor, [
        'writeWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/service/:serviceId/access/writeWhiteList/:actor',
  async (req, res, next) => {
    try {
      const { serviceId, actor } = req.params
      await AccessControl.removeActorFromList(serviceId, actor, [
        'writeWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:userId/service/:serviceId/access/blackList',
  async (req, res, next) => {
    try {
      const { serviceId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(serviceId, actor, ['blackList'])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/service/:serviceId/access/blackList/:actor',
  async (req, res, next) => {
    try {
      const { serviceId, actor } = req.params
      await AccessControl.removeActorFromList(serviceId, actor, ['blackList'])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.put(
  '/:userId/service/:serviceId/access/whiteList',
  async (req, res, next) => {
    try {
      const { serviceId } = req.params
      const { actor } = req.body
      await AccessControl.appendActorToList(serviceId, actor, [
        'readWhiteList',
        'writeWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

router.delete(
  '/:userId/service/:serviceId/access/whiteList/:actor',
  async (req, res, next) => {
    try {
      const { serviceId, actor } = req.params
      await AccessControl.removeActorFromList(serviceId, actor, [
        'readWhiteList',
        'writeWhiteList'
      ])
      res.sendStatus(200)
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
