const { redisClient } = require('./db')
const { JobType, JobValidationSchema } = require('./job')
const { getJobLogger } = require('./logger')
const { deployChain, } = require('./job_handler')


const pause = (timeout) => new Promise((resolve, reject)=>{
  setTimeout(()=>{
    resolve()
  }, timeout)
})

const getJobHandler = (job)=>{
  switch (job.type) {
    case JobType.DEPLOY_CHAIN:
      return deployChain
    default:
      throw new Error(`Job ${job.type} is not implemented`)
  }
}

const startMonitoring = async ()=>{
  while(true){
    try {
      await pause(Math.random()*1000)
      // get job from db
      const jobString = await redisClient.rpopAsync('job-queue')
      if(jobString === null) 
        continue
      console.log(`Got new job: ${jobString}`)
      const job = JSON.parse(jobString)
      const logger = getJobLogger(job)
      logger.start()
      const handler = getJobHandler(job)
      await handler(job,logger)
      logger.finish()
    } catch (error) {
      console.log(error)
    }
  }
}

startMonitoring()

