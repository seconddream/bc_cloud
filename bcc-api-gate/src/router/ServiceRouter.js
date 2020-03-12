const { Router } = require('express')

const ServiceControl = require('../control/ServiceControl')
const UserControl = require('../control/UserControl')

const router = new Router()

router.post('/:userId/service', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { name, type, config } = req.body
    const { serviceId } = await ServiceControl.createService(
      userId, name, type, config
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


module.exports = router
