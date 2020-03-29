const {Router} = require('express')
const AccessDAO = require('../data_dao/access')

const router = new Router()

router.post('/readAccess', async (req, res, next)=>{
  try {
    const { parentId } = req.body
    if (!parentId) throw new Error('Parameter reqired: parentId.')
    res.send(await AccessDAO.readAccess(parentId))
  } catch (error) {
    next(error)
  }
})

router.post('/writeAccess', async (req, res, next)=>{
  try {
    const { parentId } = req.body
    if (!parentId) throw new Error('Parameter reqired: parentId.')
    res.send(await AccessDAO.writeAccess(parentId))
  } catch (error) {
    next(error)
  }
})

router.post('/appendActorToList', async (req, res, next)=>{
  try {
    const { parentId, actor, listNames } = req.body
    if (!parentId) throw new Error('Parameter reqired: parentId.')
    if (!actor) throw new Error('Parameter reqired: actor.')
    if (!listNames) throw new Error('Parameter reqired: listNames.')
    await AccessDAO.appendActorToList(parentId, actor, listNames)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeActorFromList', async (req, res, next)=>{
  try {
    const { parentId, actor, listNames } = req.body
    if (!parentId) throw new Error('Parameter reqired: parentId.')
    if (!actor) throw new Error('Parameter reqired: actor.')
    if (!listNames) throw new Error('Parameter reqired: listNames.')
    await AccessDAO.removeActorFromList(parentId, actor, listNames)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})


router.post('/deleteAccess', async (req, res, next)=>{
  try {
    const { parentId } = req.body
    if (!parentId) throw new Error('Parameter reqired: parentId.')
    await AccessDAO.deleteAccess(parentId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})


module.exports = router