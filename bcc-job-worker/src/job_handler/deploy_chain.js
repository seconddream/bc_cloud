const Web3 = require('web3')
const web3 = new Web3(Web3.givenProvider)
const uuid = require("uuid/v1");

const { k8sCoreV1Api, k8sAppV1Api } = require("../k8s");
const ClusterObject = require("../cluster_object/index");

const getGenesisJson = (networkId, chainType, signers)=>{
  switch (chainType) {
    case 'poa':
      const alloc = {}
      signers.forEach(signer=>{
        alloc[signer.account.address.slice(2)] = {
          balance: '0x200000000000000000000000000000000000000000000000000000000000000'
        }
      })
      return {
        "config": {
          "chainId": networkId,
          "homesteadBlock": 0,
          "eip150Block": 0,
          "eip150Hash": "0x0000000000000000000000000000000000000000000000000000000000000000",
          "eip155Block": 0,
          "eip158Block": 0,
          "byzantiumBlock": 0,
          "petersburgBlock": 0,
          "constantinopleBlock": 0,
          "clique": {
            "period": 1,
            "epoch": 30000
          }
        },
        "nonce": "0x0",
        "timestamp": "0x59e50516",
        "extraData": `0x${'0'.repeat(64)}${signers.map(signer=>signer.account.address.slice(2)).join('')}${'0'.repeat(130)}`,
        "gasLimit": "0x1000000000000",
        "difficulty": "0x2",
        "mixHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
        "coinbase": "0x0000000000000000000000000000000000000000",
        "alloc": alloc,
        "number": "0x0",
        "gasUsed": "0x0",
        "parentHash": "0x0000000000000000000000000000000000000000000000000000000000000000"
      }
  
    default:
      throw new Error('Chain type not recognized.')
  }
}

const deployChain = async (job, logger) => {
  try {
    const { config } = job;
    const {
      projectId,
      chainType,
      signerCount,
      nonSignerCount,
      storageSize
    } = config;

    // create namespace --------------------------------------------------------
    logger.info(`Creating namespace in cluster...`);
    await k8sCoreV1Api.createNamespace(
      ClusterObject.Namespace.create({
        name: projectId
      })
    );
    logger.info(`Namespace ${projectId} created.`);

    // network id --------------------------------------------------------------
    const networkId = parseInt(Math.random()*10000)+100

    // create signers and non-signers ------------------------------------------
    const signers = []
    for(let i = 0; i < signerCount; i++){
      const port = (30303 + i).toString()
      const account = web3.eth.accounts.create()
      const signer = {
        account,
        password: uuid(),
        port,
      }
      signers.push(signer)
      await k8sCoreV1Api.createNamespacedSecret(
        projectId,
        ClusterObject.Secret.create({
          name: `signer${i}-secret`,
          stringData: {
            password: signer.password,
          },
        })
      );
    }

    const nonSigners = []
    for (let i=0; i < nonSignerCount; i++){
      const port = (30303 + signerCount + i).toString()
      const rpcPort = (8545 + i).toString()
      const nonSigner = {
        port, rpcPort,
      }
      nonSigners.push(nonSigner)
    }

    // create genesis.json and stores in config map
    const genesisJsonObj = getGenesisJson(networkId, chainType, signers)
    const genesis = JSON.stringify(genesisJsonObj)
    await k8sCoreV1Api.createNamespacedConfigMap(
      projectId,
      ClusterObject.ConfigMap.create({
        name: `network-config`,
        data: {
          networkId: networkId.toString(),
          genesis,
        },
      })
    )

    // create chain data pvc ---------------------------------------------------
    logger.info("Create chain-data persistent volume claim...");
    await k8sCoreV1Api.createNamespacedPersistentVolumeClaim(
      projectId,
      ClusterObject.PersistentVolumeClaim.create({
        name: "bootnode-data",
        storage: "1Mi"
      })
    );
    logger.info("Chain-data persistent volume claim created.");
    
    // create chain storage pvc ------------------------------------------------
    for(let i=0; i<(signerCount + nonSignerCount); i++){
      logger.info(`Create node ${i} persistent volume claim...`);
    await k8sCoreV1Api.createNamespacedPersistentVolumeClaim(
      projectId,
      ClusterObject.PersistentVolumeClaim.create({
        name: `node${i}-data`,
        storage: storageSize
      })
      );
      logger.info(`Node ${i} persistent volume claim created.`);
      
      // const chain_data_pvc_result = await k8sCoreV1Api.listNamespacedPersistentVolumeClaim(projectId)
      // console.log(chain_data_pvc_result)
    }
    
    // chain deployment --------------------------------------------------------
    logger.info(`Deploy chain containers...`);
    const chainDeploymentResult = await k8sAppV1Api.createNamespacedDeployment(
      projectId,
      ClusterObject.ChainDeployment.create({
        chainName: projectId,
        singers,
        nonSigners
      })
    );
    logger.info(`Chain containers deployed.`);

  } catch (error) {
    console.log(error);
    logger.error(error);
  }
};

module.exports = deployChain;
