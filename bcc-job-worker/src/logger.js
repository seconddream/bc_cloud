const { redisClient } = require('./db')

const LOG_TYPE = {
  INFO: 'I-',
  ERROR: 'E-',
  DEBUG: 'D-',
  WARNING: 'W-',
  START: 'I-',
  FINISH: 'F-',
}


const emitLog = (id, type, data)=>{
  const key = `log:job:${id}`
  const message = `${type}${data}`
  console.log(`${key}>${message}`)
  redisClient.rpush(key, message)
  redisClient.publish(key, message)
}

const getJobLogger = (job)=>{
  return {
    info: (message)=>{
      emitLog(job.id, LOG_TYPE.INFO, message)
    },
    debug: (message)=>{
      emitLog(job.id, LOG_TYPE.DEBUG, message)
    },
    error: (error)=>{
      if(error.response){
        emitLog(job.id, LOG_TYPE.ERROR, error.response.body.message)
      }else{
        console.log(error)
        emitLog(job.id, LOG_TYPE.ERROR, error.message)
      }
    },
    warning: (message)=>{
      emitLog(job.id, LOG_TYPE.WARNING, message)
    },
    start: ()=>{
      emitLog(job.id, LOG_TYPE.INFO, `Job ${job.type}:${job.id} started...`)
    },
    finish: ()=>{
      emitLog(job.id, LOG_TYPE.INFO, `Job ${job.type}:${job.id} finished.`)
    },
  }
}

module.exports = {
  getJobLogger
}