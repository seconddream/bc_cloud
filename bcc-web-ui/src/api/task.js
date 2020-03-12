import {APIGate} from './connection'

export const getUserTaskList = async userId => {
  return await APIGate.get(`/user/${userId}/task`)
}

export const getUserTask = async (userId, taskId) => {
  return await APIGate.get(`/user/${userId}/task/${taskId}`)
}
