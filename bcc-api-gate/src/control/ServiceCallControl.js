const { callDBGate, callTransactionGate } = require('../connection')

module.exports = {
  callService: async (serviceId, option = {}) => {
    const { callArgs, gas, gasPrice } = option
    const service = await callDBGate('/service/readService', { serviceId })
    // console.log(service)
    const { userId, name, createdOn, type, config } = service
    const { chainId, contractId, functionName } = config

    const result = await callTransactionGate(
      `/callContractMethod/${contractId}/${functionName}`,
      { callArgs, gas, gasPrice }
    )

    return {
      type: result.transactionHash && result.transactionHash !== '' ? 'receipt': 'returnValue',
      data: result
    }
  }
}
