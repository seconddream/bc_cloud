const { callDBGate } = require('../connection')
const moment = require('moment')

const createTask = async (userId, type, name, params) => {
  const { taskId } = await callDBGate('/task/writeTask', {
    userId,
    type,
    name,
    params
  })
  await callDBGate('/user/appendTask', { userId, taskId })
  await callDBGate('/task/publishTask', { taskId })
  await callDBGate('/task/appendLog', {
    taskId,
    type: 'INFO',
    timestamp: moment().valueOf(),
    message: 'Task pushed to queue.'
  })

  await callDBGate('/task/updateStatus', { taskId, status: 'In Queue' })
  return taskId
}

module.exports = {
  getTask: async taskId => {
    const task = await callDBGate('/task/readTask', { taskId })
    return task
  },
  getUserTaskList: async userId => {
    const { tasks } = await callDBGate('/user/readUserById', { userId })
    const taskList = await callDBGate('/task/readTaskList', { tasks })
    return taskList
  },
  createChainInstanceDeployTask: async (userId, chainId) => {
    const taskParams = { userId, chainId }
    const { name } = await callDBGate('/chain/readChain', { chainId })
    const taskId = await createTask(
      userId,
      'CHAIN_INSTANCE_DEPLOY',
      `Create ${name} chain deployment`,
      taskParams
    )
    return { taskId }
  },
  createChainInstanceDeleteTask: async (userId, chainId) => {
    const taskParams = { userId, chainId }
    const { name } = await callDBGate('/chain/readChain', { chainId })
    const taskId = await createTask(
      userId,
      'CHAIN_INSTANCE_DELETE',
      `Delete ${name} chain deployment`,
      taskParams
    )
    return { taskId }
  },
  createChainDeleteTask: async (userId, chainId) => {
    const taskParams = { userId, chainId }
    const { name } = await callDBGate('/chain/readChain', { chainId })
    const taskId = await createTask(
      userId,
      'CHAIN_DELETE',
      `Delete ${name} chain`,
      taskParams
    )
    return { taskId }
  },

  createProjectCompileTask: async (userId, projectId) => {
    const params = { userId, projectId }
    const { name } = await callDBGate('/project/readProject', { projectId })
    const taskId = await createTask(
      userId,
      'PROJECT_COMPILE',
      `Compile project ${name}`,
      params
    )
    return { taskId }
  },

  createArtifactDeployTask: async (
    userId,
    chainId,
    projectId,
    artifactName,
    args,
    gas,
    gasPrice
  ) => {
    const params = { projectId, artifactName, chainId, args, gas, gasPrice }
    const taskId = await createTask(
      userId,
      'PROJECT_ARTIFACT_DEPLOY',
      `Deploy artifact ${artifactName} to chain ${chainId}`,
      params
    )
    return { taskId }
  },

  createDatastoreDeployTask: async (userId, chainId, name, type, columns) => {
    const params = { userId, chainId, name, type, columns }
    const taskId = await createTask(
      userId,
      'DATASTORE_DEPLOY',
      `Deploy datastore ${name} to chain ${chainId}`,
      params
    )
    return { taskId }
  },

  createPerformanceTestTask: async (userId, pk, serviceId1c, serviceId1t, serviceId2c, serviceId2t, datastoreId, contractId )=>{
    const params = {userId, pk, serviceId1c, serviceId1t, serviceId2c, serviceId2t, datastoreId, contractId }
    const taskId = await createTask(
      userId,
      'PERFORMANCE',
      `performance test`,
      params
    )
    return { taskId }
  }

}
