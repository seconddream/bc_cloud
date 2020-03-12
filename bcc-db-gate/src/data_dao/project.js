const c = require('ansi-colors')
const moment = require('moment')
const ObjectID = require('mongodb').ObjectID
const { mongoClient } = require('../connection')

// project data collection
const projectCollection = mongoClient.db('bcc-data').collection('project')
const ProjectNotFoundError = new Error('Project not found.')

module.exports = {
  // write project
  writeProject: async (userId, name) => {
    const { insertedId } = await projectCollection.insertOne({
      userId, // creater and owner of the project
      name, // project display name
      createdOn: moment().valueOf(), // timestamp
      files: {},
      compilerVersion: null,
      compileErrors: [],
      artifacts: {}
    })
    const project = { projectId: insertedId.toHexString() }
    return project
  },

  // read project by id
  readProject: async projectId => {
    const projectDoc = await projectCollection
      .find({ _id: new ObjectID(projectId) })
      .toArray()
    if (projectDoc.length === 0) throw ProjectNotFoundError
    const project = projectDoc[0]
    project.projectId = project._id.toHexString()
    delete project._id
    return project
  },

  // read projects by a list of ids
  readProjectList: async projects => {
    const docs = await projectCollection
      .find({ _id: { $in: projects.map(id => new ObjectID(id)) } })
      .project({ name: 1, createdOn: 1, files: 1 })
      .toArray()
    return docs.map(doc => {
      const { _id, name, createdOn, files } = doc
      return {
        projectId: _id.toHexString(),
        name,
        createdOn,
        fileCount: Object.keys(files).length
      }
    })
  },

  // delete project by id

  deleteProject: async projectId => {
    const { value } = await projectCollection.findOneAndDelete({
      _id: new ObjectID(projectId)
    })
    if (value === null) throw ProjectNotFoundError
  },

  // update project files
  updateProjectFiles: async (projectId, files) => {
    const { value } = await projectCollection.findOneAndUpdate(
      { _id: new ObjectID(projectId) },
      { $set: { files } }
    )
    if (value === null) throw ProjectNotFoundError
  },

  // update project artifacts
  updateCompilerVersion: async (projectId, compilerVersion) => {
    // console.log('db gate: ', compilerVersion)
    const { value } = await projectCollection.findOneAndUpdate(
      { _id: new ObjectID(projectId) },
      { $set: { compilerVersion } }
    )
    if (value === null) throw ProjectNotFoundError
  },

  // update project artifacts
  updateArtifacts: async (projectId, artifacts) => {
    const { value } = await projectCollection.findOneAndUpdate(
      { _id: new ObjectID(projectId) },
      { $set: { artifacts } }
    )
    if (value === null) throw ProjectNotFoundError
  },

  // update project compiler errors
  updateCompileErrors: async (projectId, compileErrors) => {
    const { value } = await projectCollection.findOneAndUpdate(
      { _id: new ObjectID(projectId) },
      { $set: { compileErrors } }
    )
    if (value === null) throw ProjectNotFoundError
  }
}
