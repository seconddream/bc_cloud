import { APIGate } from './connection'

export const getUserProjectList = async userId => {
  return await APIGate.get(`/user/${userId}/project`)
}

export const getUserProject = async (userId, projectId) => {
  return await APIGate.get(`/user/${userId}/project/${projectId}`)
}

export const createUserProject = async (userId, name) => {
  return await APIGate.post(`/user/${userId}/project`, { name })
}

export const deleteUserProject = async (userId, projectId) => {
  return await APIGate.delete(`/user/${userId}/project/${projectId}`)
}

export const updateUserProjectFiles = async (userId, projectId, files) => {
  return await APIGate.put(`/user/${userId}/project/${projectId}/files`, {
    files
  })
}

export const updateUserProjectCompilerVersion = async (
  userId,
  projectId,
  compilerVersion
) => {
  // console.log('web-ui: ', compilerVersion)
  return await APIGate.put(
    `/user/${userId}/project/${projectId}/compilerVersion`,
    {
      compilerVersion
    }
  )
}

export const compileUserProject = async (userId, projectId) => {
  return await APIGate.post(`/user/${userId}/project/${projectId}/compile`)
}
