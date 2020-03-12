const { Router } = require('express')
const ChainDAO = require('../data_dao/chain')

const router = new Router()

router.post('/writeChain', async (req, res, next) => {
  try {
    const { userId, name } = req.body
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!name) throw new Error('Parameter reqired: name.')
    res.send(await ChainDAO.writeChain(userId, name))
  } catch (error) {
    next(error)
  }
})

router.post('/readChain', async (req, res, next) => {
  try {
    const { chainId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    res.send(await ChainDAO.readChain(chainId))
  } catch (error) {
    next(error)
  }
})

router.post('/readChainList', async (req, res, next) => {
  try {
    const { chains } = req.body
    if (!chains) throw new Error('Parameter reqired: chains.')
    res.send(await ChainDAO.readChainList(chains))
  } catch (error) {
    next(error)
  }
})

router.post('/deleteChain', async (req, res, next) => {
  try {
    const { chainId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    await ChainDAO.deleteChain(chainId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateChainConfiguration', async (req, res, next) => {
  try {
    const { chainId, config } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!config) throw new Error('Parameter reqired: config.')
    await ChainDAO.updateChainConfiguration(chainId, config)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateChainStatus', async (req, res, next) => {
  try {
    const { chainId, status } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!status) throw new Error('Parameter reqired: status.')
    await ChainDAO.updateChainStatus(chainId, status)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateChainDeployment', async (req, res, next) => {
  try {
    const { chainId, deployment } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    await ChainDAO.updateChainDeployment(chainId, deployment)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendContract', async (req, res, next) => {
  try {
    const { chainId, contractId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!contractId) throw new Error('Parameter reqired: contractId.')
    await ChainDAO.appendContract(chainId, contractId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeContract', async (req, res, next) => {
  try {
    const { chainId, contractId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!contractId) throw new Error('Parameter reqired: contractId.')
    await ChainDAO.removeContract(chainId, contractId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendService', async (req, res, next) => {
  try {
    const { chainId, serviceId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!serviceId) throw new Error('Parameter reqired: serviceId.')
    await ChainDAO.appendService(chainId, serviceId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeService', async (req, res, next) => {
  try {
    const { chainId, serviceId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!serviceId) throw new Error('Parameter reqired: serviceId.')
    await ChainDAO.removeService(chainId, serviceId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/appendDatastore', async (req, res, next) => {
  try {
    const { chainId, datastoreId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    await ChainDAO.appendDatastore(chainId, datastoreId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/removeDatastore', async (req, res, next) => {
  try {
    const { chainId, datastoreId } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')
    await ChainDAO.removeDatastore(chainId, datastoreId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})


module.exports = router
