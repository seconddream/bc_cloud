// import Web3 from 'web3'
// import { chainTransactionURL } from './Connection'

// export const signTransaction = async (
//   chainName,
//   unSignedTransaction,
//   account,
//   privateKey,
//   to,
//   gas = 1000000000
// ) => {
//   try {
//     const web3 = new Web3(chainTransactionURL + chainName + ':8548')
//     return await web3.eth.accounts.signTransaction(
//       {
//         data: '0x' + unSignedTransaction,
//         from: account,
//         to,
//         gas,
//         gasPrice: 0
//       },
//       privateKey
//     )
//   } catch (error) {
//     console.log(error)
//     throw new Error('Transaction sign failed.')
//   }
// }

// export const getDeployArtifactTransaction = (artifact, args) => {
//   try {
//     const web3 = new Web3()
//     const { abi, evm } = artifact
//     const bytecode = evm.bytecode.object

//     const deployTransaction = new web3.eth.Contract(abi)
//       .deploy({
//         data: bytecode,
//         arguments: args ? args : null
//       })
//       .encodeABI()
//     // console.log(deployTransaction)
//     return deployTransaction
//   } catch (error) {
//     console.log(error)
//     throw new Error('Create aritfact deploy transaction failed: ' + error.message)
//   }
// }
