const c = require('ansi-colors')
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const { mongoClient } = require('../connection')

// chain data collection
const chainCollection = mongoClient.db('bcc-data').collection('chain')
const ChainNotFoundError = new Error('Chain not found')

module.exports = {
  // write chain
  writeChain: async (userId, name) => {
    const existChain = await chainCollection.find({ name }).toArray()
    if (existChain.length > 0) {
      throw new Error('Chain name exists.')
    }
    const { insertedId } = await chainCollection.insertOne({
      userId,
      name,
      createdOn: moment().valueOf(),
      status: 'No Instance',
      config: null,
      deployment: null,
      contracts: [],
      services: [],
      datastores: [],
      masterAccountNonce: 0,
    })
    const chain = { chainId: insertedId.toHexString() }
    return chain
  },

  // read chain by chain id
  readChain: async chainId => {
    const chainDocs = await chainCollection
      .find({ _id: new ObjectID(chainId) })
      .toArray()
    if (chainDocs.length === 0) throw ChainNotFoundError

    const chain = chainDocs[0]
    delete chain._id
    chain.chainId = chainId
    // const { deployment } = chain
    // if (deployment && deployment.status === 'Deployed') {
    //   try {
    //     const res = await k8sCoreV1Api.listNamespacedPod(
    //       deployment.namespace,
    //       true
    //     )
    //     deployment.pods = res.body.items
    //   } catch (error) {
    //     console.log(error.response.body.message)
    //   }
    // }
    return chain
  },

  // read chain by a list of id
  readChainList: async chains => {
    const chainDocs = await chainCollection
      .find({ _id: { $in: chains.map(chainId => new ObjectID(chainId)) } })
      .toArray()
    return chainDocs.map(chain => {
      const { _id, name, createdOn, status, config, deployment } = chain
      return {
        chainId: _id.toHexString(),
        name,
        createdOn,
        status,
        config,
        deployment
      }
    })
  },

  // delete chain by id
  deleteChain: async chainId => {
    const { value } = await chainCollection.findOneAndDelete({
      _id: new ObjectID(chainId)
    })
    if (value === null) throw ChainNotFoundError
  },

  // update chain configuration
  updateChainConfiguration: async (chainId, config) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $set: { config } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // update chain status
  updateChainStatus: async (chainId, status) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $set: { status } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // update chain configuration
  updateChainDeployment: async (chainId, deployment) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $set: { deployment } }
    )
    if (value === null) throw ChainNotFoundError
  },

  getMasterAccountNonce: async chainId => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $inc: { "deployment.masterAccountNonce": 1 } }
    )
    if (value === null) throw ChainNotFoundError
    return { nonce: value.deployment.masterAccountNonce }
  },

  // append contract id from chain contract list
  appendContract: async (chainId, contractId) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $push: { contracts: contractId } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // remove contract id from chain contract list
  removeContract: async (chainId, contractId) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $pull: { contracts: contractId } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // append service id from chain service list
  appendService: async (chainId, serviceId) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $push: { services: serviceId } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // remove service id from chain service list
  removeService: async (chainId, serviceId) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $pull: { services: serviceId } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // append datastore id from chain datastore list
  appendDatastore: async (chainId, datastoreId) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $push: { datastores: datastoreId } }
    )
    if (value === null) throw ChainNotFoundError
  },

  // append datastore id from chain datastore list
  removeDatastore: async (chainId, datastoreId) => {
    const { value } = await chainCollection.findOneAndUpdate(
      { _id: new ObjectID(chainId) },
      { $pull: { datastores: datastoreId } }
    )
    if (value === null) throw ChainNotFoundError
  }
}
