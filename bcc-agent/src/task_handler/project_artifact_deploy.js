const k8s = require('../k8s')
const { callDBGate, callTransactionGate } = require('../connection')

module.exports = async (task, taskLogger) => {
  const { params } = task
  const {
    projectId,
    artifactName,
    chainId,
    args,
    gas,
    gasPrice
  } = params

  taskLogger.info(`Retrieving artifact ${artifactName}...`)
  // read project
  const project = await callDBGate('/project/readProject', { projectId })
  // read artifact
  const artifact = project.artifacts[artifactName]
  if (!artifact)
    throw new Error(
      `Artifact ${artifactName} not found in project ${projectId}.`
    )

  taskLogger.info(`Reading chain configuration...`)
  //read chain
  const chain = await callDBGate('/chain/readChain', { chainId })

  if (chain.deployment === null || chain.status !== 'Deployed')
    throw new Error(`Chain ${chain.name} deployment not ready.`)
  if (chain.config.expose)
    throw new Error('Chain exposed, artifact deploy from bcc not supported.')

  // deploy contract
  const receipt = await callTransactionGate('/deployContract', {
    chainId,
    abi: artifact.abi,
    bytecode: artifact.evm.bytecode.object,
    deployArgs: args,
    gas,
    gasPrice
  })

  // save contrac to db
  const { contractId } = await callDBGate('/contract/writeContract', {
    chainId,
    name: artifactName,
    compilerVersion: project.compilerVersion,
    abi: artifact.abi,
    receipt
  })
  await callDBGate('/chain/appendContract', { chainId, contractId })

  taskLogger.info(
    `Artifact deployed on chain ${chain.name}, contract address: ${receipt.contractAddress}`
  )
}
