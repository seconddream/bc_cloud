const { Router } = require('express')
const c = require('ansi-colors')

const UserControl = require('../control/UserControl')
const AccessControl = require('../control/AccessControl')

const router = new Router()

router.all('/user/:userId*', async (req, res, next) => {
  try {
    const { userId } = req.params
    if (['credential', 'login'].includes(userId)) {
      next()
      return
    }
    const { accountAddr } = await UserControl.getUser(userId)
    const actor = AccessControl.getActorFromReq(req)
    if (actor !== accountAddr) throw new Error('Identity validation failed.')
    next()
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

router.all('/datastore/:datastoreId/:contractId*', async (req, res, next) => {
  try {
    const { datastoreId, contractId } = req.params
    const actor = AccessControl.getActorFromReq(req)
    if (contractId === 'read') {
      console.log('read check')
      if (await AccessControl.canRead(datastoreId, actor)) {
        next()
      } else {
        throw new Error('Actor can not read.')
      }
    } else {
      console.log('write check')

      if (await AccessControl.canWrite(datastoreId, actor)) {
        next()
      } else {
        throw new Error('Actor can not write.')
      }
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

router.all('/service/:serviceId/', async (req, res, next) => {
  try {
    const { serviceId } = req.params
    const actor = AccessControl.getActorFromReq(req)
    console.log('read check')
    if (await AccessControl.canRead(serviceId, actor)) {
      next()
    } else {
      throw new Error('Actor can not read.')
    }
  } catch (error) {
    console.log(error)
    res.sendStatus(401)
  }
})

module.exports = router
