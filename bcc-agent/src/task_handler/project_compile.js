const solc = require('solc')
const { callDBGate, callTransactionGate } = require('../connection')

module.exports = async (task, taskLogger) => {
  const { params } = task
  const { projectId, userId } = params

  // get project
  taskLogger.info(`Loading project ${projectId}...`)
  const project = await callDBGate('/project/readProject', { projectId })

  // compile
  taskLogger.info(`Compiling...`)
  const {
    compilerversion,
    artifacts,
    compileErrors
  } = await callTransactionGate('/compile', {
    sources: project.files,
    compilerVersion: project.compilerVersion,
  })


  // update project
  await callDBGate('/project/updateArtifacts', {
    projectId,
    artifacts
  })

  await callDBGate('/project/updateCompileErrors', {
    projectId,
    compileErrors
  })


  if(compileErrors.length > 0){
    taskLogger.warning(`Compile encountered error.`)
  }
  taskLogger.info('Artifacts updated.')
}
