const { Router } = require('express')
const ProjectDAO = require('../data_dao/project')

const router = new Router()

router.post('/writeProject', async (req, res, next) => {
  try {
    const { userId, name } = req.body
    if (!userId) throw new Error('Parameter reqired: userId.')
    if (!name) throw new Error('Parameter reqired: name.')
    res.send(await ProjectDAO.writeProject(userId, name))
  } catch (error) {
    next(error)
  }
})

router.post('/readProject', async (req, res, next) => {
  try {
    const { projectId } = req.body
    if (!projectId) throw new Error('Parameter reqired: projectId.')
    res.send(await ProjectDAO.readProject(projectId))
  } catch (error) {
    next(error)
  }
})

router.post('/readProjectList', async (req, res, next) => {
  try {
    const { projects } = req.body
    if (!projects) throw new Error('Parameter reqired: projects.')
    res.send(await ProjectDAO.readProjectList(projects))
  } catch (error) {
    next(error)
  }
})

router.post('/deleteProject', async (req, res, next) => {
  try {
    const { projectId } = req.body
    if (!projectId) throw new Error('Parameter reqired: projectId.')
    await ProjectDAO.deleteProject(projectId)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/writeProjectFiles', async (req, res, next) => {
  try {
    const { projectId, files } = req.body
    if (!projectId) throw new Error('Parameter reqired: projectId.')
    if (!files) throw new Error('Parameter reqired: files.')
    await ProjectDAO.updateProjectFiles(projectId, files)
    res.sendStatus(200)

  } catch (error) {
    next(error)
  }
})

router.post('/updateCompilerVersion', async (req, res, next) => {
  try {
    const { projectId, compilerVersion } = req.body
    if (!projectId) throw new Error('Parameter reqired: projectId.')
    if (!compilerVersion) throw new Error('Parameter reqired: compilerVersion.')
    await ProjectDAO.updateCompilerVersion(projectId, compilerVersion)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateArtifacts', async (req, res, next) => {
  try {
    const { projectId, artifacts } = req.body
    if (!projectId) throw new Error('Parameter reqired: projectId.')
    if (!artifacts) throw new Error('Parameter reqired: artifacts.')
    await ProjectDAO.updateArtifacts(projectId, artifacts)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

router.post('/updateCompileErrors', async (req, res, next) => {
  try {
    const { projectId, compileErrors } = req.body
    if (!projectId) throw new Error('Parameter reqired: projectId.')
    // if (!compileErrors) throw new Error('Parameter reqired: compileErrors.')
    await ProjectDAO.updateCompileErrors(projectId, compileErrors)
    res.sendStatus(200)
  } catch (error) {
    next(error)
  }
})

module.exports = router
