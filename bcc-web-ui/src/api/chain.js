import {APIGate} from './connection'

export const getUserChainList = async userId => {
  const chainList =  await APIGate.get(`/user/${userId}/chain`)
  return chainList
}

export const getUserChain = async (userId, chainId) => {
  return await APIGate.get(`/user/${userId}/chain/${chainId}`)
}

export const createUserChain = async (userId, name) => {
  return await APIGate.post(`/user/${userId}/chain`, { name })
}

export const deleteUserChain = async (userId, chainId) => {
  return await APIGate.delete(`/user/${userId}/chain/${chainId}`)
}

export const updateUserChainConfig = async (
  userId,
  chainId,
  config
) => {
  return await APIGate.put(`/user/${userId}/chain/${chainId}/`, {
    config
  })
}

export const createUserChainDeployment = async (userId, chainId) => {
  return await APIGate.post(
    `/user/${userId}/chain/${chainId}/deployment`
  )
}

export const deleteUserChainDeployment = async (userId, chainId) => {
  return await APIGate.delete(
    `/user/${userId}/chain/${chainId}/deployment`
  )
}

export const deployProjectArtifactToUserChain = async (
  userId,
  chainId,
  projectId,
  artifactName,
  args
) => {
  return await APIGate.post(
    `/user/${userId}/chain/${chainId}/deployment/artifact_deploy`,
    {
      projectId,
      artifactName,
      args
    }
  )
}
