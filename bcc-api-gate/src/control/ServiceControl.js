const { callDBGate } = require('../connection')

module.exports = {
  createService: async (userId, name, type, config) => {
    const { serviceId } = await callDBGate('/service/writeService', {
      userId,
      name,
      type,
      config
    })
    await callDBGate('/user/appendService', {userId, serviceId})
    return { serviceId }
  },

  getService: async serviceId => {
    const service = await callDBGate('/service/readService', {serviceId})
    return service
  },

  getUserServiceList: async userId => {
    const { services } = await callDBGate('/user/readUserById', {userId})
    const serviceList = await callDBGate('/service/readServiceList', {services})
    return serviceList
  },

  deleteService: async (userId, serviceId) => {
    await callDBGate('/service/deleteService', {serviceId})
    await callDBGate('/user/removeService', {userId, serviceId})
  }
}
