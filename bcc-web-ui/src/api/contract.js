import { APIGate } from './connection'

export const getUserChainContractList = async (userId, chainId) => {
  return await APIGate.get(
    `/user/${userId}/chain/${chainId}/deployment/contracts`
  )
}

export const getUserChainContract = async (userId, chainId, contractId) => {
  return await APIGate.get(
    `/user/${userId}/chain/${chainId}/deployment/contracts/${contractId}`
  )
}

export const deleteUserChainContract = async (userId, chainId, contractId) => {
  return await APIGate.delete(
    `/user/${userId}/chain/${chainId}/deployment/contracts/${contractId}`
  )
}
