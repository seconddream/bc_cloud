import { APIGate } from './connection'

export const getUserTaskList = async (userId) => {
  return await APIGate.get(`/user/${userId}/task`)
}

export const getUserTask = async (userId, taskId) => {
  return await APIGate.get(`/user/${userId}/task/${taskId}`)
}

export const createPerformanceTestTask = async (
  userId, pk, serviceId1c, serviceId1t, serviceId2c, serviceid2t, datastoreId, contractId
) => {
  return await APIGate.post('/test', {
    userId, pk, serviceId1c, serviceId1t, serviceId2c, serviceid2t, datastoreId, contractId
  })
}
