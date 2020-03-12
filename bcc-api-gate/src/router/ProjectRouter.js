const { Router } = require('express')

const TaskControl = require('../control/TaskControl')
const ProjectControl = require('../control/ProjectControl')

const router = new Router()

// create user project
router.post('/:userId/project', async (req, res, next) => {
  try {
    const { userId } = req.params
    const { name } = req.body
    const project = await ProjectControl.createProject(userId, name)
    res.send(project)
  } catch (error) {
    next(error)
  }
})

// get user projects
router.get('/:userId/project', async (req, res, next) => {
  try {
    const { userId } = req.params
    const projectList = await ProjectControl.getProjectList(userId)
    res.send(projectList)
  } catch (error) {
    next(error)
  }
})

// get user project
router.get('/:userId/project/:projectId', async (req, res, next) => {
  try {
    const { projectId } = req.params
    const project = await ProjectControl.getProject(projectId)
    res.send(project)
  } catch (error) {
    next(error)
  }
})

// delete user project
router.delete('/:userId/project/:projectId', async (req, res, next) => {
  try {
    const { userId, projectId } = req.params
    await ProjectControl.deleteProject(userId, projectId)
    res.send()
  } catch (error) {
    next(error)
  }
})

// update files in user project
router.put('/:userId/project/:projectId/files', async (req, res, next) => {
  try {
    const { userId, projectId } = req.params
    const { files } = req.body
    await ProjectControl.updateProjectFiles(projectId, files)
    res.send()
  } catch (error) {
    next(error)
  }
})

// update files in user project
router.put('/:userId/project/:projectId/compilerVersion', async (req, res, next) => {
  try {
    const { userId, projectId } = req.params
    const { compilerVersion } = req.body
    await ProjectControl.updateProjectCompilerVersion(projectId, compilerVersion)
    res.send()
  } catch (error) {
    next(error)
  }
})


// create compile task in user project
router.post('/:userId/project/:projectId/compile', async (req, res, next) => {
  try {
    const { userId, projectId } = req.params
    const { taskId } = await TaskControl.createProjectCompileTask(
      userId,
      projectId
    )
    res.send({ taskId })
  } catch (error) {
    next(error)
  }
})

module.exports = router
