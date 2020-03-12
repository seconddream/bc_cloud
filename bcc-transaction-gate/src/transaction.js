const Web3 = require('web3')
const solc = require('solc')

const k8s = require('./k8s')
const {callDBGate} = require('./connection')


const ChainExposedError = new Error(
  'Transaction to exposed chain not supported.'
)
const ChainInstanceNotRead = new Error(
  'Chain instance has no deployment or not ready.'
)

const loadRemoteCompilerVersion = (version)=>new Promise((resolve, reject)=>{
  console.log('loading compiler version : ', version)
  solc.loadRemoteVersion(version, (error, compiler) => {
    if (error) {
      reject(error)
    }
    resolve(compiler)
  })
})

const compile = async (sources, compilerVersion) => {
  // prepare input
  const input = {
    language: 'Solidity',
    sources: {},
    settings: {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      }
    }
  }
  for (const [filename, sourceCode] of Object.entries(sources)) {
    input.sources[filename] = {
      content: sourceCode
    }
  }

  // compile
  let output = null
  let compiler = solc
  if (compilerVersion) {
    compiler = await loadRemoteCompilerVersion(compilerVersion)
  } 
  output = JSON.parse(compiler.compile(JSON.stringify(input)))

  let artifacts = {}
  if(!output.errors){
    for (const [filename, fileContent] of Object.entries(output.contracts)) {
      artifacts = { ...artifacts, ...fileContent }
    }
  }


  const result = {
    compilerVersion: compilerVersion ? compilerVersion : solc.version(),
    artifacts,
    compileErrors: output.errors ? output.errors : [],
  }

  
  return result
}

const deployContract = async (
  chainId,
  abi,
  bytecode,
  deployArgs,
  gas,
  gasPrice
) => {
  // read chain info
  const chain = await callDBGate('/chain/readChain', {chainId})
  if (chain.config.expose) {
    throw ChainExposedError
  }
  if (!chain.deployment || chain.status !== 'Deployed') {
    throw ChainInstanceNotRead
  }

  // prepare web3 instance
  const namespace = chain.deployment.namespace
  const providerURL = `http://transaction.${namespace}.svc.cluster.local:8545`
  const web3 = new Web3(providerURL)

  // use master account in chain for transaction
  const { account, privateKey } = await k8s.getChainMasterAccount(namespace)

  // create deploy transaction
  const tx = new web3.eth.Contract(abi)
    .deploy({
      data: bytecode,
      arguments: deployArgs ? deployArgs : null
    })
    .encodeABI()

  // sign transaction with chain master account
  const signedTx = await web3.eth.accounts.signTransaction(
    {
      nonce: await web3.eth.getTransactionCount(account),
      data: '0x' + tx,
      from: account,
      to: null,
      gas: gas ? gas : parseInt(chain.config.gasLimit * 0.7),
      gasPrice: gasPrice? gasPrice : 0,
    },
    privateKey
  )

  // send transaction to chain
  const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  return receipt
}

const callContractMethod = async (
  contractId,
  methodName,
  callArgs,
  gas,
  gasPrice,
) => {
  // read contract
  const contract = await callDBGate('/contract/readContract', {contractId})
  // console.log(contract)
  const { abi, receipt, chainId } = contract
  if (!abi) {
    throw new Error('No abi in contract found.')
  }
  if (!receipt) {
    throw new Error('Contract deployment is not finished.')
  }
  // read chain
  const chain = await callDBGate('/chain/readChain', {chainId})
  // console.log(chain)
  if (chain.config.expose) {
    throw ChainExposedError
  }
  if (!chain.deployment || chain.status !== 'Deployed') {
    throw ChainInstanceNotRead
  }

  // prepare web3 instance
  const namespace = chain.deployment.namespace
  const providerURL = `http://transaction.${namespace}.svc.cluster.local:8545`
  const web3 = new Web3(providerURL)

  // use master account in chain for transaction
  const { account, privateKey } = await k8s.getChainMasterAccount(namespace)

  // create contract instance
  const contractInstance = new web3.eth.Contract(abi, receipt.contractAddress)

  // check method to be called
  const methodToBeCalled = abi.filter(a => a.name === methodName)
  if (methodToBeCalled.length === 0) {
    throw new Error(`Method does not exist: ${methodName}.`)
  }
  const signRequired = !methodToBeCalled[0].constant

  if (signRequired) {
    // send signed transaction with master account
    // creat method call transaction
    let tx = null
    if (callArgs) {
      tx = contractInstance.methods[methodName](...callArgs).encodeABI()
    } else {
      tx = contractInstance.methods[methodName]().encodeABI()
    }
    // sign with master account
    const signedTx = await web3.eth.accounts.signTransaction(
      {
        nonce: await web3.eth.getTransactionCount(account),
        from: account,
        data: tx,
        to: receipt.contractAddress,
        gas: gas ? gas : parseInt(chain.config.gasLimit * 0.7),
        gasPrice: gasPrice ? gasPrice : 0,
      },
      privateKey
    )
    // send transaction
    return await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction
    )
  } else {
    // send unsigned transaction
    if (callArgs) {
      return await contractInstance.methods[methodName](...callArgs).call()
    } else {
      return await contractInstance.methods[methodName]().call()
    }
  }
}

module.exports = {
  compile,
  deployContract,
  callContractMethod
}
