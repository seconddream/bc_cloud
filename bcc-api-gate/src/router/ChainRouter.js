const { Router } = require('express')

const ChainControl = require('../control/ChainControl')
const TaskControl = require('../control/TaskControl')
const UserControl = require('../control/UserControl')

const router = new Router()


// create user chain
router.post('/:userId/chain', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { name } = req.body
    const { chainId } = await ChainControl.createChain(userId, name)
    res.send({ chainId })
  } catch (error) {
    next(error)
  }
})

// update chain configuration router
router.put('/:userId/chain/:chainId', async (req, res, next) => {
  try {
    const { userId, chainId } = req.params
    const { config } = req.body
    await ChainControl.updateChainConfiguration(chainId, config)
    res.send()
  } catch (error) {
    next(error)
  }
})

router.get('/:userId/chain', async (req, res, next) => {
  try {
    const { userId } = req.params
    const chainList = await ChainControl.getUserChainList(userId)
    res.send(chainList)
  } catch (error) {
    next(error)
  }
})

router.get('/:userId/chain/:chainId', async (req, res, next) => {
  try {
    const { chainId } = req.params
    const chain = await ChainControl.getChain(chainId)
    res.send(chain)
  } catch (error) {
    next(error)
  }
})

router.delete('/:userId/chain/:chainId', async (req, res, next) => {
  try {
    const { userId, chainId } = req.params
    const { taskId } = await TaskControl.createChainDeleteTask(userId, chainId)
    res.send({ taskId })
  } catch (error) {
    next(error)
  }
})

router.post('/:userId/chain/:chainId/deployment', async (req, res, next) => {
  try {
    const { userId, chainId } = req.params
    const { taskId } = await TaskControl.createChainInstanceDeployTask(
      userId,
      chainId
    )
    res.send({ chainId, taskId })
  } catch (error) {
    next(error)
  }
})

router.delete('/:userId/chain/:chainId/deployment', async (req, res, next) => {
  try {
    const { userId, chainId } = req.params
    const { taskId } = await TaskControl.createChainInstanceDeleteTask(
      userId,
      chainId
    )
    res.send({ taskId })
  } catch (error) {
    next(error)
  }
})

router.post(
  '/:userId/chain/:chainId/deployment/artifact_deploy',
  async (req, res, next) => {
    try {
      const { userId, chainId } = req.params
      const { projectId, artifactName, args } = req.body
      const { taskId } = await TaskControl.createArtifactDeployTask(
        userId,
        chainId,
        projectId,
        artifactName,
        args
      )
      res.send({ taskId })
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
