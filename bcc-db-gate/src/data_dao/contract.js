const c = require('ansi-colors')
const ObjectID = require('mongodb').ObjectID
const { mongoClient } = require('../connection')
const moment = require('moment')

const ContractNotFoundError = new Error('Contract Not Found.')

const contractCollection = mongoClient.db('bcc-data').collection('contract')

const writeContract = async (chainId, name, compilerVersion, abi, receipt) => {
  const { insertedId } = await contractCollection.insertOne({
    chainId,
    name,
    deployedOn: moment().valueOf(),
    compilerVersion,
    abi,
    receipt
  })
  const contract = { contractId: insertedId.toHexString() }
  return contract
}

const readContract = async contractId => {
  const contractDoc = await contractCollection
    .find({ _id: new ObjectID(contractId) })
    .toArray()
  if (contractDoc.length === 0) throw ContractNotFoundError
  const contract = contractDoc[0]
  contract.contractId = contract._id.toHexString()
  delete contract._id
  return contract
}

const readContractList = async contracts => {
  const contractDocs = await contractCollection
    .find({ _id: { $in: contracts.map(contractId => new ObjectID(contractId)) } })
    .toArray()
  return contractDocs.map(contract => {
    const { _id, chainId, name, compilerVersion, abi, receipt} = contract
    return { contractId: _id.toHexString(), chainId, name, compilerVersion, abi, receipt }
  })
}

const deleteContract = async contractId => {
  const { value } = await contractCollection.findOneAndDelete({
    _id: new ObjectID(contractId)
  })
  if (value === null) throw ContractNotFoundError
}

module.exports = {
  writeContract,
  readContract,
  readContractList,
  deleteContract
}
