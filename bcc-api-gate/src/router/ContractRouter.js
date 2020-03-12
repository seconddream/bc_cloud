const { Router } = require('express')

const TaskControl = require('../control/TaskControl')
const ContractControl = require('../control/ContractControl')

const router = new Router()

// read contract list route
router.get(
  '/:userId/chain/:chainId/deployment/contracts',
  async (req, res, next) => {
    try {
      const { chainId } = req.params
      const contracts = await ContractControl.getContractList(chainId)
      res.send(contracts)
    } catch (error) {
      next(error)
    }
  }
)

// read contract route
router.get(
  '/:userId/chain/:chainId/deployment/contracts/:contractId',
  async (req, res, next) => {
    try {
      const { contractId } = req.params
      const contract = await ContractControl.getContract(contractId)
      res.send(contract)
    } catch (error) {
      next(error)
    }
  }
)

// delete contract route
router.delete(
  '/:userId/chain/:chainId/deployment/contracts/:contractId',
  async (req, res, next) => {
    try {
      console.log('deleteing')
      const { contractId, chainId } = req.params
      const contract = await ContractControl.deleteChainContract(chainId, contractId)
      res.send(contract)
    } catch (error) {
      next(error)
    }
  }
)

module.exports = router
