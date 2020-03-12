const { Router } = require('express')
const ServiceCallControl = require('../control/ServiceCallControl')

const router = new Router()

router.post('/:serviceId', async (req, res, next) => {
  try {
    const { serviceId } = req.params
    const { option } = req.body
    res.send(
      await ServiceCallControl.callService(serviceId, option)
    )
  } catch (error) {
    next(error)
  }
})

module.exports = router
