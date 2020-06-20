const { callDBGate } = require('./connection')
const { getTaskLogger } = require('./logger')

const chainInstanceDelete = require('./task_handler/chain_instance_delete')
const chainInstanceDeploy = require('./task_handler/chain_instance_deploy')
const chainDelete = require('./task_handler/chain_delete')
const datastoreDeploy = require('./task_handler/datastore_deploy')
const projectArtifactDeploy = require('./task_handler/project_artifact_deploy')
const projectCompile = require('./task_handler/project_compile')
const performance = require('./task_handler/performance_test')

module.exports = {
  run: async (task) => {
    const { taskId, type } = task
    const taskLogger = getTaskLogger(taskId)
    taskLogger.start()
    await callDBGate('/task/updateStatus', { taskId, status: 'Executing' })
    let taskHandler = null
    try {
      switch (type) {
        case 'CHAIN_INSTANCE_DEPLOY':
          taskHandler = chainInstanceDeploy
          break
        case 'CHAIN_INSTANCE_DELETE':
          taskHandler = chainInstanceDelete
          break
        case 'CHAIN_DELETE':
          taskHandler = chainDelete
          break
        case 'DATASTORE_DEPLOY':
          taskHandler = datastoreDeploy
          break
        case 'PROJECT_ARTIFACT_DEPLOY':
          taskHandler = projectArtifactDeploy
          break
        case 'PROJECT_COMPILE':
          taskHandler = projectCompile
          break
        case 'PERFORMANCE':
          taskHandler = performance
          break

        default:
          throw new Error(`Task type: ${type} not implemented.`)
      }
      await taskHandler(task, taskLogger)
      taskLogger.end()
      await callDBGate('/task/updateStatus', { taskId, status: 'Finished' })
    } catch (error) {
      console.log(error)
      taskLogger.error(error.message)
      taskLogger.end()
      await callDBGate('/task/updateStatus', { taskId, status: 'Terminated' })
    }
  },
}
