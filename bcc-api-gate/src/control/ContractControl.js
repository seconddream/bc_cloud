const { callDBGate } = require('../connection')

module.exports = {
  getContract: async contractId => {
    // const contract = await ContractDAO.readContract(contractId)
    const contract = await callDBGate('/contract/readContract', {contractId})
    return contract
  },

  getContractList: async chainId => {
    // const { contracts } = await ChainDAO.readChain(chainId)
    const { contracts } = await callDBGate('/chain/readChain', {chainId})
    return await callDBGate('/contract/readContractList', {contracts})
  },
  deleteChainContract : async (chainId, contractId) => {
    await callDBGate('/contract/deleteContract', {contractId})
    await callDBGate('/chain/removeContract', {chainId, contractId})
  }

}
