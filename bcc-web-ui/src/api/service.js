import {APIGate} from './connection'

export const createUserService = async (userId, name, config) => {
  await APIGate.post(`/user/${userId}/service`, {
    name,
    type: 'common',
    config
  })
}

export const getUserServiceList = async (userId) => {
  return await APIGate.get(`/user/${userId}/service`)
}

export const getUserService = async (userId, serviceId) => {
  return await APIGate.get(`/user/${userId}/service/${serviceId}`)
}

export const deleteUserService = async (userId, serviceId) => {
  return await APIGate.delete(`/user/${userId}/service/${serviceId}`)

}

export const callUserService = async (serviceId, option) => {
  return await APIGate.post(`/service/${serviceId}`, {option})
}



