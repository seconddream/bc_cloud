const Schema = require('validate')

const {JOB_TYPE} = require('./constants')

const JobHandler = {
  [JOB_TYPE.DEPLOY_CHAIN]: require('./job_handler/deploy_chain')
}

module.exports={
  JobValidationSchema,
  JobHandler
}
