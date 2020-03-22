const { Router } = require('express')
const UserControl = require('../control/UserControl')

const router = new Router()


router.post('/credential', async (req, res, next) => {
  try {
    const { email } = req.body
    const credential = await UserControl.getCredential(email)
    res.send(credential)
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, tokenSignature } = req.body
    const user = await UserControl.login(email, tokenSignature)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { email, accountAddr, keystore } = req.body
    const user = await UserControl.signUp(email, accountAddr, keystore)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

router.get('/:userId', async (req, res, next) => {
  try {
    const user = await UserControl.getUser(req.params.userId)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

router.delete('/:userId', async (req, res, next) => {
  try {
    await UserControl.deleteUser(req.params.userId)
    res.send()
  } catch (error) {
    next(error)
  }
})



module.exports = router
