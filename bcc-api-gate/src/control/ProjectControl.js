const { callDBGate } = require('../connection')

module.exports = {
  createProject: async (userId, name) => {
    const {projectId} = await callDBGate('/project/writeProject', {userId, name})
    await callDBGate('/user/appendProject', {userId, projectId})
    return { projectId }
  },

  getProject: async projectId => {
    const project = await callDBGate('/project/readProject', {projectId})
    return project
  },

  getProjectList: async userId => {
    const { projects } = await callDBGate('/user/readUserById', {userId})
    const projectList = await callDBGate('/project/readProjectList', {projects})
    return projectList
  },

  updateProjectFiles: async (projectId, files) => {
    await callDBGate('/project/writeProjectFiles', {projectId, files})
  },

  updateProjectCompilerVersion: async (projectId, compilerVersion) => {
    // console.log('api gate: ', compilerVersion)
    await callDBGate('/project/updateCompilerVersion', {projectId, compilerVersion})
  },

  deleteProject: async (userId, projectId)=>{
    await callDBGate('/project/deleteProject', {projectId})
    await callDBGate('/user/removeProject', {userId, projectId})

  }

}
