const { Router } = require('express')
const ContractDAO = require('../data_dao/contract')

const router = new Router()

router.post('/writeContract', async (req, res, next) => {
  try {
    const { chainId, name, compilerVersion, abi, receipt } = req.body
    if (!chainId) throw new Error('Parameter reqired: chainId.')
    if (!name) throw new Error('Parameter reqired: name.')
    if (!compilerVersion) throw new Error('Parameter reqired: compilerVersion.')
    if (!abi) throw new Error('Parameter reqired: abi.')
    if (!receipt) throw new Error('Parameter reqired: receipt.')
    res.send(
      await ContractDAO.writeContract(
        chainId,
        name,
        compilerVersion,
        abi,
        receipt
      )
    )
  } catch (error) {
    next(error)
  }
})

router.post('/readContract', async (req, res, next) => {
  try {
    const { contractId } = req.body
    if (!contractId) throw new Error('Parameter reqired: contractId.')
    res.send(await ContractDAO.readContract(contractId))
  } catch (error) {
    next(error)
  }
})

router.post('/readContractList', async (req, res, next) => {
  try {
    const { contracts } = req.body
    if (!contracts) throw new Error('Parameter reqired: contracts.')
    res.send(await ContractDAO.readContractList(contracts))
  } catch (error) {
    next(error)
  }
})

router.post('/deleteContract', async (req, res, next) => {
  try {
    const { contractId } = req.body
    if (!contractId) throw new Error('Parameter reqired: contractId.')
    await ContractDAO.deleteContract(contractId)
    res.send(200)
  } catch (error) {
    next(error)
  }
})

module.exports = router
