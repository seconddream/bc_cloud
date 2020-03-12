const c = require('ansi-colors')
const ObjectID = require('mongodb').ObjectID
const { redisClient, mongoClient } = require('../connection')

const UIDGenerator = require('uid-generator')
const uidgen = new UIDGenerator(512)

// user data collection
const userCollection = mongoClient.db('bcc-data').collection('user')

module.exports = {
  // write user
  writeUser: async (email, accountAddr, keystore) => {
    // ckeck pre conditions
    if (!email) throw new Error('Parameter reqired: email.')
    if (!accountAddr) throw new Error('Parameter reqired: accountAddr.')
    if (!keystore) throw new Error('Parameter reqired: keystore.')
    let existUserDocs = await userCollection.find({ email }).toArray()
    if (existUserDocs.length > 0) throw new Error('User email exists.')
    existUserDocs = await userCollection.find({ accountAddr }).toArray()
    if (existUserDocs.length > 0) throw new Error('Account address taken.')

    const { insertedId } = await userCollection.insertOne({
      email,
      accountAddr,
      keystore,
      projects: [],
      chains: [],
      tasks: [],
      services: [],
      datastores: []
    })
    const user = { userId: insertedId.toHexString() }
    return user
  },

  // read user by id
  readUserById: async userId => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    const userDoc = await userCollection
      .find({ _id: new ObjectID(userId) })
      .toArray()
    if (userDoc.length === 0) {
      throw new Error('User not found.')
    }
    const user = userDoc[0]
    delete user._id
    user.userId = userId
    return user
  },

  // read user by email
  readUserByEmail: async email => {
    if (!email) throw new Error('Parameter reqired: email.')
    const userDoc = await userCollection.find({ email }).toArray()
    if (userDoc.length === 0) {
      throw new Error('User not found.')
    }
    const user = userDoc[0]
    user.userId = user._id.toHexString()
    delete user._id
    return user
  },

  // read user by accout address
  readUserByAccountAddr: async accountAddr => {
    if (!accountAddr) throw new Error('Parameter reqired: accountAddr.')

    const userDoc = await userCollection.find({ accountAddr }).toArray()
    if (userDoc.length === 0) {
      throw new Error('User not found.')
    }
    const user = userDoc[0]
    user.userId = user._id.toHexString()
    delete user._id
    return user
  },

  // delete user
  deleteUser: async userId => {
    if (!userId) throw new Error('Parameter reqired: userId.')

    const { value } = await userCollection.findOneAndDelete({
      _id: new ObjectID(userId)
    })
    if (!value) {
      throw new Error('User not found.')
    }
  },

  // append project id to user project list
  appendProject: async (userId, projectId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!projectId) throw new Error('Parameter reqired: projectId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $push: { projects: projectId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // append chain id to user chain list
  appendChain: async (userId, chainId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!chainId) throw new Error('Parameter reqired: chainId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $push: { chains: chainId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // append task id to user task list
  appendTask: async (userId, taskId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!taskId) throw new Error('Parameter reqired: taskId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $push: { tasks: taskId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // append service id to user service list
  appendService: async (userId, serviceId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!serviceId) throw new Error('Parameter reqired: serviceId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $push: { services: serviceId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // append datastore id to user datastore list
  appendDatastore: async (userId, datastoreId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $push: { datastores: datastoreId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // remove project id from user project list
  removeProject: async (userId, projectId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!projectId) throw new Error('Parameter reqired: projectId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $pull: { projects: projectId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // remove chain id from user chain list
  removeChain: async (userId, chainId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!chainId) throw new Error('Parameter reqired: chainId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $pull: { chains: chainId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // remove task id from user task list
  removeTask: async (userId, taskId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!taskId) throw new Error('Parameter reqired: taskId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $pull: { tasks: taskId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // reomve service id from user service list
  removeService: async (userId, serviceId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!serviceId) throw new Error('Parameter reqired: servicId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $pull: { services: serviceId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  // remove datastore id from user datastore list
  removeDatastores: async (userId, datastoreId) => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!datastoreId) throw new Error('Parameter reqired: datastoreId.')

    const { value } = await userCollection.findOneAndUpdate(
      { _id: new ObjectID(userId) },
      { $pull: { datastores: datastoreId } }
    )
    if (value === null) throw new Error('User not found.')
  },

  refreshUserToken: async userId => {
    if (!userId) throw new Error('Parameter reqired: userId.')

    const token = await uidgen.generate()
    console.log(c.gray(`User ${userId} token refreshed to : ${token}`))
    await redisClient.setAsync(`auth:token:${userId}`, token)
    return token
  },

  readUserToken: async userId => {
    if (!userId) throw new Error('Parameter reqired: userId.')
    return await redisClient.getAsync(`auth:token:${userId}`)
  }
}
