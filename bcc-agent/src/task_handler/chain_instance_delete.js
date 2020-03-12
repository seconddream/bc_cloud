const k8s = require('../k8s')
const { callDBGate } = require('../connection')

module.exports = async (task, taskLogger) => {
  const { params } = task
  const { chainId } = params

  const chain = await callDBGate('/chain/readChain', { chainId })
  if (!chain.deployment) throw new Error('No Deployment found.')
  const namespace = chain.deployment.namespace

  try {
    await k8s.deleteNamespace(namespace)
    await k8s.waitNamespaceDeleted(namespace, 10 * 60)
  } catch (error) {
    console.log(error)
  }
  if (chain.config.expose) {
    const ingress = await k8s.getIngress()
    const rules = [...ingress.spec.rules]
    const paths = rules[0].http.paths.filter(
      p => p.path !== `/chain/${chain.name}`
    )
    rules[0].http.paths = paths
    await k8s.patchIngress({
      ...ingress,
      spec: { ...ingress.spec, rules }
    })
    await k8s.k8sCoreV1Api.deleteNamespacedService(
      `external-transaction-${chain.name}`,
      'default'
    )
  }
  await callDBGate('/chain/updateChainDeployment', {
    chainId,
    deployment: null
  })
  await callDBGate('/chain/updateChainStatus', {
    chainId,
    status: 'No Instance'
  })
  taskLogger.info(`Chain instance deleted.`)

  // todo: delete related datastore, contract, services,
}
