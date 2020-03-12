const c = require('ansi-colors')
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const { mongoClient } = require('../connection')

// service data collection
const serviceCollection = mongoClient.db('bcc-data').collection('service')
const ServiceNotFoundError = new Error('Service not found.')

module.exports = {
  // write servic
  writeService: async (userId, name, type, config) => {
    const { insertedId } = await serviceCollection.insertOne({
      userId,
      name,
      createdOn: moment().valueOf(),
      type,
      config
    })
    const service = { serviceId: insertedId.toHexString() }
    return service
  },

  // read service by Id
  readService: async serviceId => {
    const doc = await serviceCollection
      .find({ _id: new ObjectID(serviceId) })
      .toArray()
    if (doc.length === 0) throw ServiceNotFoundError
    const service = doc[0]
    service.serviceId = serviceId
    delete service._id
    return service
  },

  // read services by a list of ids
  readServiceList: async services => {
    const docs = await serviceCollection
      .find({ _id: { $in: services.map(id => new ObjectID(id)) } })
      .toArray()
    return docs.map(doc => {
      const { _id, name, createdOn, type, config } = doc
      return {
        serviceId: _id.toHexString(),
        name,
        createdOn,
        type,
        config
      }
    })
  },

  // delete service
  deleteService: async serviceId => {
    const { value } = await serviceCollection.findOneAndDelete({
      _id: new ObjectID(serviceId)
    })
    if (value === null) throw ServiceNotFoundError
  }
}
