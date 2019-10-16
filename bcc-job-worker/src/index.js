const { redisClient } = require('./db')
const { JobHandler } = require('./job')
const { getJobLogger } = require('./logger')


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

      // parse job object
      const job = JSON.parse(jobString)
      // prepare logger
      const logger = getJobLogger(job)
      // get job handler
      const handler = JobHandler[job.type]
      if(!handler)
        throw new Error(`Job ${job.type} is not implemented`)
      
      // execute job
      await handler(job, logger)

    } catch (error) {
      console.log(error)
    }
  }
}

startMonitoring()

