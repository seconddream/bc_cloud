const { Router } = require('express')
const UserControl = require('../control/UserControl')

const router = new Router()


router.post('/credential', async (req, res, next) => {

  // use email as username is decapcated but still supported
  try {
    const { email, username } = req.body
    const credential = await UserControl.getCredential(username ? username : email)
    res.send(credential)
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, username, tokenSignature } = req.body
    const user = await UserControl.login(username ? username : email, tokenSignature)
    res.send(user)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { email, accountAddr, keystore, username } = req.body
    const user = await UserControl.signUp(username? username: email, accountAddr, keystore)
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
