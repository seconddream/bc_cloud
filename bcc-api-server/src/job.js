const redis = require("redis");
const uuid = require("uuid/v1");
const moment = require("moment");
const Schema = require('validate')

const BCCJobType = {
  DEPLOY_CHAIN: 'DEPLOY_CHAIN',
  DELETE_CHAIN: 'DELETE_CHAIN',
}

const BCCJobValidationSchema = {
  DEPLOY_CHAIN: new Schema({
    projectId: {
      required: true,
      message: {
        required: 'Project ID is reqired for DEPLOY_CHAIN'
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

// redis client
const redisClient = redis.createClient({
  host: process.env.REDIS_SERVICE_HOST,
  port: process.env.REDIS_SERVICE_PORT
});

redisClient.on("error", error => {
  throw error;
});
redisClient.on("connect", () => {
  console.log("api_server: connected to redis server...");
});


const publishJob = (type, config) =>
  new Promise((resolve, reject) => {
    // job validation
    const validateSchema = BCCJobValidationSchema[type];
    if (!validateSchema){
      reject(`Job ${type} not implemented`)
      return
    } 
    const validationErrors = validateSchema.validate(config);
    if (validationErrors.length > 0){
      reject(validationErrors.map(error => error.message).join("; "));
      return
    }
    // create job
    const jobObject = {
      id: uuid(),
      createAt: moment().valueOf(),
      type,
      config
    };
    const jobString = JSON.stringify(jobObject);
    // push job to job queue
    redisClient.LPUSH(`job-queue`, jobString, (error, res) => {
      if (error){
        reject(error);
        return
      } 
      resolve(jobObject.id);
    });
  });

const getJobQueue = () =>
  new Promise((resolve, reject) => {
    redisClient.LRANGE("job-queue", 0, -1, (error, res) => {
      if (error){
        reject(error)
        return
      }
      const jobQueue = [];
      for (const jobString of res) {
        jobQueue.push(JSON.parse(jobString));
      }
      resolve(jobQueue);
    });
  });


const clearJobQueue = () =>
  new Promise((resolve, reject) => {
    redisClient.DEL("job-queue", (error, res) => {
      if (error){
        reject(error);
        return
      } 
      resolve();
    });
  });

  
module.exports = {
  BCCJobType,
  BCCJobValidationSchema,
  publishJob,
  getJobQueue,
  clearJobQueue,
};
