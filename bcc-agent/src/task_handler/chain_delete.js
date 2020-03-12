const { callDBGate } = require('../connection')
const k8s = require('../k8s')

module.exports = async (task, taskLogger) => {
  const { params } = task
  const { chainId, userId } = params

  const chain = await callDBGate('/chain/readChain', { chainId })
  const chainName = chain.name
  try {
    await k8s.deleteNamespace(chainName)
  } catch (error) {
    taskLogger.warning(error.response.body.message)
  }
  await k8s.waitNamespaceDeleted(chainName, 5 * 60)
  taskLogger.info(`Namespace ${chainName} deleted.`)
  await callDBGate('/chain/deleteChain', { chainId })
  await callDBGate('/user/removeChain', { userId, chainId })

  taskLogger.info(`User chain ${chainName} deleted.`)
}
