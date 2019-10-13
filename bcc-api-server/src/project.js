const {BCCJobType, publishJob} = require('./job')

const deployChain = async (req, res)=>{
  console.log('new api.............')
  const { projectId } = req.params
  try {
    const id = await publishJob(BCCJobType.DEPLOY_CHAIN, {
      projectId,
      ...req.body
    })
    res.json({error:null, id})
  } catch (error) {
    res.json({error})
  }
}

module.exports = {
  deployChain
}