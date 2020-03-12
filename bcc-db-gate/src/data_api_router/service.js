const { Router } = require('express')
const ServiceDAO = require('../data_dao/service')

const router = new Router()

router.post('/writeService', async (req, res, next) => {
  try {
    const { userId, name, type, config } = req.body
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!name) throw new Error('Parameter reqired: name.')
    if (!type) throw new Error('Parameter reqired: type.')
    if (!config) throw new Error('Parameter reqired: config.')
    res.send(await ServiceDAO.writeService(userId, name, type, config))
  } catch (error) {
    next(error)
  }
})

router.post('/readService', async (req, res, next) => {
  try {
    const { serviceId } = req.body
    if (!serviceId) throw new Error('Parameter reqired: serviceId.')
    res.send(await ServiceDAO.readService(serviceId))
  } catch (error) {
    next(error)
  }
})

router.post('/readServiceList', async (req, res, next) => {
  try {
    const { services } = req.body
    if (!services) throw new Error('Parameter reqired: services.')
    res.send(await ServiceDAO.readServiceList(services))
  } catch (error) {
    next(error)
  }
})

router.post('/deleteService', async (req, res, next) => {
  try {
    const { serviceId } = req.body
    if (!serviceId) throw new Error('Parameter reqired: serviceId.')
    await ServiceDAO.deleteService(serviceId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})


module.exports = router

