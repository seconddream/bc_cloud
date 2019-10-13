const Schema = require('validate')


const JobType = {
  DEPLOY_CHAIN: 'DEPLOY_CHAIN',
  DELETE_CHAIN: 'DELETE_CHAIN',
}


const JobValidationSchema = {
  DEPLOY_CHAIN: new Schema({
    projectId: {
      required: true,
      message: {
        required: 'projectId is reqired for DEPLOY_CHAIN'
      }
    },
    chainType: {
      required: true,
      message: {
        required: 'Chain type is required for DEPLOY_CHAIN',
      },
    },
    signerCount: {
      required: true,
      message: {
        required: 'Signer count is required for DEPLOY_CHAIN',
      },
    },
    nonSignerCount: {
      required: true,
      message: {
        required: 'Non-signer count is required for DEPLOY_CHAIN',
      },
    },
    storageSize: {
      required: true,
      message: {
        required: 'Storage size is required for DEPLOY_CHAIN',
      },
    },
  }),
  DELETE_CHAIN: new Schema({
    namespace: {
      required: true,
      message: {
        required: 'Namespace is reqired for DELETE_CHAIN'
      }
    }
  }),
}


module.exports={
  JobType,
  JobValidationSchema,
}
