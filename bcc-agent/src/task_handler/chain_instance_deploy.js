const Web3 = require('web3')
const UIDGenerator = require('uid-generator')
const moment = require('moment')
const k8s = require('../k8s')
const { callDBGate } = require('../connection')

const uidgen = new UIDGenerator(64)
const db_username = process.env.DB_USERNAME
const db_password = process.env.DB_PASSWORD

const createSealerAccounts = sealerNodeCount => {
  const web3 = new Web3()
  const sealerAccounts = []
  for (let i = 0; i < sealerNodeCount; i++) {
    const sealerName = `sealer-${i}`
    const sealerAccount = web3.eth.accounts.create()
    const password = uidgen.generateSync()
    sealerAccounts.push({
      sealerName,
      address: sealerAccount.address,
      privateKey: sealerAccount.privateKey.slice(2),
      password
    })
  }
  return sealerAccounts
}

const createMasterAccount = () => {
  const web3 = new Web3()
  const masterAccount = web3.eth.accounts.create()
  return {
    address: masterAccount.address,
    privateKey: masterAccount.privateKey.slice(2)
  }
}

const createNetworkConfig = (chainType, sealerAccounts) => {
  // create genesis json
  const networkId = parseInt(Math.random() * 10000) + 100
  let genesis = null
  switch (chainType) {
    case 'clique':
      const alloc = {}
      sealerAccounts.forEach(sealerAccount => {
        alloc[sealerAccount.address.slice(2)] = {
          balance:
            '0x200000000000000000000000000000000000000000000000000000000000000'
        }
      })
      genesis = {
        config: {
          chainId: networkId,
          homesteadBlock: 0,
          eip150Block: 0,
          eip150Hash:
            '0x0000000000000000000000000000000000000000000000000000000000000000',
          eip155Block: 0,
          eip158Block: 0,
          byzantiumBlock: 0,
          petersburgBlock: 0,
          constantinopleBlock: 0,
          clique: {
            period: 1,
            epoch: 30000
          }
        },
        nonce: '0x0',
        timestamp: '0x59e50516',
        extraData: `0x${'0'.repeat(64)}${sealerAccounts
          .map(sealerAccount => sealerAccount.address.slice(2))
          .join('')}${'0'.repeat(130)}`,
        gasLimit: '0x1000000000000',
        difficulty: '0x2',
        mixHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000',
        coinbase: '0x0000000000000000000000000000000000000000',
        alloc: alloc,
        number: '0x0',
        gasUsed: '0x0',
        parentHash:
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      }
      break

    default:
      throw new Error('Chain type not supported.')
  }
  return { networkId: networkId.toString(), genesis: JSON.stringify(genesis) }
}

const createBootnodeDeployment = async chainName => {
  return await k8s.k8sAppV1Api.createNamespacedDeployment(chainName, {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'bootnode',
      labels: {
        component: 'bootnode'
      }
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          component: 'bootnode'
        }
      },
      template: {
        metadata: {
          labels: {
            component: 'bootnode'
          }
        },
        spec: {
          volumes: [
            {
              name: 'data',
              persistentVolumeClaim: {
                claimName: 'bootnode'
              }
            }
          ],
          containers: [
            {
              name: 'bootnode',
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                'bootnode --nodekey=/bcc/bootnode/node.key --verbosity=9'
              ],
              ports: [
                {
                  name: 'discovery-udp',
                  containerPort: 30301,
                  protocol: 'UDP'
                }
              ],
              volumeMounts: [
                {
                  name: 'data',
                  mountPath: '/bcc/bootnode'
                }
              ]
            }
          ],
          initContainers: [
            {
              name: 'bootnode-genkey',
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                `bootnode --genkey=/bcc/bootnode/node.key && \
                  echo "enode://$(bootnode -writeaddress --nodekey=/bcc/bootnode/node.key)" \
                  >> /bcc/bootnode/bootnodeAddress && \
                  cat /bcc/bootnode/bootnodeAddress`
              ],
              volumeMounts: [
                {
                  name: `data`,
                  mountPath: '/bcc/bootnode'
                }
              ]
            }
          ]
        }
      }
    }
  })
}

const createBootnodeService = async chainName => {
  return await k8s.k8sCoreV1Api.createNamespacedService(chainName, {
    metadata: {
      name: 'bootnode'
    },
    spec: {
      type: 'ClusterIP',
      selector: {
        component: 'bootnode'
      },
      ports: [
        {
          port: 30301,
          targetPort: 30301,
          protocol: 'UDP'
        }
      ]
    }
  })
}

const createSealerNodeDeployment = async (
  chainName,
  sealerAccount,
  config
) => {
  return await k8s.k8sAppV1Api.createNamespacedDeployment(chainName, {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: sealerAccount.sealerName,
      labels: {
        component: sealerAccount.sealerName
      }
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          component: sealerAccount.sealerName
        }
      },
      template: {
        metadata: {
          labels: {
            component: sealerAccount.sealerName
          }
        },
        spec: {
          volumes: [
            {
              name: 'network',
              configMap: {
                name: 'network'
              }
            },
            {
              name: 'bootnode-data',
              persistentVolumeClaim: {
                claimName: 'bootnode'
              }
            },
            {
              name: 'data',
              persistentVolumeClaim: {
                claimName: sealerAccount.sealerName
              }
            },
            {
              name: 'account',
              secret: {
                secretName: sealerAccount.sealerName,
                items: [
                  { key: 'password', path: 'password' },
                  { key: 'privateKey', path: 'privateKey' }
                ]
              }
            }
          ],
          containers: [
            {
              name: sealerAccount.sealerName,
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                `geth \
                --datadir /bcc/data \
                --bootnodes=\`cat /bcc/bootnode-data/bootnodeAddress\`@$(BOOTNODE_SERVICE_HOST):30301 \
                --port 30303 \
                --unlock $(ACCOUNT_ADDRESS) \
                --password /bcc/account/password \
                --networkid $(NETWORK_ID) \
                --miner.gasprice ${config.gasPrice} \
                --miner.gastarget ${config.gasTarget} \
                --miner.gaslimit ${config.gasLimit} \
                --txpool.pricelimit ${config.txpoolPriceLimit} \
                --mine \
                --verbosity=5`
              ],
              ports: [
                {
                  name: 'dicovery-udp',
                  containerPort: 30303,
                  protocol: 'UDP'
                },
                {
                  name: 'dicovery-tcp',
                  containerPort: 30303
                }
              ],
              env: [
                {
                  name: 'ACCOUNT_ADDRESS',
                  valueFrom: {
                    secretKeyRef: {
                      name: sealerAccount.sealerName,
                      key: 'address'
                    }
                  }
                },
                {
                  name: 'NETWORK_ID',
                  valueFrom: {
                    configMapKeyRef: {
                      name: 'network',
                      key: 'networkId'
                    }
                  }
                }
              ],
              volumeMounts: [
                { name: 'network', mountPath: '/bcc/network' },
                { name: 'bootnode-data', mountPath: '/bcc/bootnode-data' },
                { name: 'data', mountPath: '/bcc/data' },
                { name: 'account', mountPath: '/bcc/account' }
              ]
            }
          ],
          initContainers: [
            {
              name: `${sealerAccount.sealerName}-init`,
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                `printf "$(PASSWORD)\n$(PASSWORD)\n" | geth --datadir /bcc/data account import /bcc/account/privateKey && \
                  geth --datadir /bcc/data init /bcc/network/genesis `
              ],
              env: [
                {
                  name: 'PASSWORD',
                  valueFrom: {
                    secretKeyRef: {
                      name: sealerAccount.sealerName,
                      key: 'password'
                    }
                  }
                }
              ],
              volumeMounts: [
                { name: 'network', mountPath: '/bcc/network' },
                { name: 'data', mountPath: '/bcc/data' },
                { name: 'account', mountPath: '/bcc/account' }
              ]
            }
          ]
        }
      }
    }
  })
}

const createTransactionNodeService = async chainName => {
  return await k8s.k8sCoreV1Api.createNamespacedService(chainName, {
    metadata: {
      name: 'transaction'
    },
    spec: {
      type: 'ClusterIP',
      selector: {
        component: 'transaction'
      },
      ports: [
        {
          name: 'rpc',
          port: 8545,
          targetPort: 8545,
          protocol: 'TCP'
        },
        {
          name: 'ws',
          port: 8546,
          targetPort: 8546,
          protocol: 'TCP'
        }
      ]
    }
  })
}

const createTransactionNodeServiceExternalName = async chainName => {
  return await k8s.k8sCoreV1Api.createNamespacedService('default', {
    metadata: {
      name: `external-transaction-${chainName}`
    },
    spec: {
      type: 'ExternalName',
      externalName: `transaction.${chainName}.svc.cluster.local`,
      ports: [
        {
          name: 'rpc',
          port: 8545,
          targetPort: 8545,
          protocol: 'TCP'
        },
        {
          name: 'ws',
          port: 8546,
          targetPort: 8546,
          protocol: 'TCP'
        }
      ]
    }
  })
}

const createTransactionNodeDeployment = async (chainName, count) => {
  return await k8s.k8sAppV1Api.createNamespacedDeployment(chainName, {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'transaction',
      labels: {
        component: 'transaction'
      }
    },
    spec: {
      replicas: count,
      selector: {
        matchLabels: {
          component: 'transaction'
        }
      },
      template: {
        metadata: {
          labels: {
            component: 'transaction'
          }
        },
        spec: {
          volumes: [
            {
              name: 'network',
              configMap: {
                name: 'network'
              }
            },
            {
              name: 'bootnode-data',
              persistentVolumeClaim: {
                claimName: 'bootnode'
              }
            },
            {
              name: 'data',
              emptyDir: {}
            }
          ],
          containers: [
            {
              name: 'transaction',
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                `geth \
                --bootnodes=\`cat /bcc/bootnode-data/bootnodeAddress\`@$(BOOTNODE_SERVICE_HOST):30301 \
                --port 30303 \
                --rpc \
                --rpcaddr "0.0.0.0" \
                --rpcvhosts='*' \
                --ws \
                --wsorigins='*' \
                --rpcapi=eth,net,web3 \
                --rpccorsdomain='*' \
                --networkid $(NETWORK_ID) \
                --verbosity=5`
              ],
              ports: [
                {
                  name: 'rpc',
                  containerPort: 8545,
                  protocol: 'TCP'
                },
                {
                  name: 'ws',
                  containerPort: 8546,
                  protocol: 'TCP'
                },
                {
                  name: 'dicovery-udp',
                  containerPort: 30303,
                  protocol: 'UDP'
                },
                {
                  name: 'dicovery-tcp',
                  containerPort: 30303
                }
              ],
              env: [
                {
                  name: 'NETWORK_ID',
                  valueFrom: {
                    configMapKeyRef: {
                      name: 'network',
                      key: 'networkId'
                    }
                  }
                }
              ],
              volumeMounts: [
                { name: 'network', mountPath: '/bcc/network' },
                { name: 'bootnode-data', mountPath: '/bcc/bootnode-data' },
                { name: 'data', mountPath: '/root/.ethereum' }
              ]
            },
            {
              name: 'bcc-datastore-agent',
              image: 'bsfans/bcc-datastore-agent',
              imagePullPolicy: 'IfNotPresent',
              ports: [
                // {
                //   name: 'chain-service',
                //   containerPort: 5001
                // }
              ],
              env: [
                {
                  name: 'DB_USERNAME',
                  value: db_username
                },
                {
                  name: 'DB_PASSWORD',
                  value: db_password
                },
                {
                  name: 'NAMESPACE',
                  value: chainName
                }
              ]
            }
          ],
          initContainers: [
            {
              name: `transaction-init`,
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: ['-c', `geth init /bcc/network/genesis`],
              env: [],
              volumeMounts: [
                { name: 'network', mountPath: '/bcc/network' },
                { name: 'data', mountPath: '/root/.ethereum' }
              ]
            }
          ]
        }
      }
    }
  })
}

const createChainDatastoreAgentDeployment = async chainName => {
  return await k8s.k8sAppV1Api.createNamespacedDeployment(chainName, {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: 'datastore-agent',
      labels: {
        component: 'datastore-agent'
      }
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          component: 'datastore-agent'
        }
      },
      template: {
        metadata: {
          labels: {
            component: 'datastore-agent'
          }
        },
        spec: {
          containers: [
            {
              name: 'bcc-datastore-agent',
              image: 'bsfans/bcc-datastore-agent',
              imagePullPolicy: 'IfNotPresent',
              ports: [
                // {
                //   name: 'chain-service',
                //   containerPort: 5001
                // }
              ],
              env: [
                {
                  name: 'DB_USERNAME',
                  value: db_username
                },
                {
                  name: 'DB_PASSWORD',
                  value: db_password
                },
                {
                  name: 'NAMESPACE',
                  value: chainName
                }
              ]
            }
          ]
        }
      }
    }
  })
}

module.exports = async (task, taskLogger) => {
  const { params } = task
  const { chainId, userId } = params
  if (task.userId !== userId)
    throw new Error(`Task created by different chain user.`)

  const chain = await callDBGate('/chain/readChain', { chainId })
  console.log(chain.config)

  const chainName = chain.name
  const {
    type,
    sealerNodeCount,
    transactionNodeCount,
    gasPrice,
    gasLimit,
    gasTarget,
    txpoolPriceLimit,
    expose
  } = chain.config

  if (!['No Instance', 'Failed'].includes(chain.status) ) {
    throw new Error('Chain has instance deployed currently.')
  }

  await callDBGate('/chain/updateChainStatus', { chainId, status: 'Deploying' })

  try {
    // create cluster namespace
    taskLogger.info(`Creating namespace ${chainName}...`)
    await k8s.createNamespace(chainName)
    taskLogger.info(`Cluster namespace created.`)

    // create sealer accounts and cluster secrets
    taskLogger.info(`Creating sealer accounts for chain instance...`)
    const sealerAccounts = createSealerAccounts(sealerNodeCount)
    // taskLogger.debug(sealerAccounts)
    for (const sealerAccount of sealerAccounts) {
      await k8s.createSecret(chainName, sealerAccount.sealerName, sealerAccount)
    }
    taskLogger.info('Sealer accounts for chain instance created.')

    // create network configmap
    taskLogger.info('Configuring chain instance network...')
    const network = createNetworkConfig(type, sealerAccounts)
    await k8s.createConfigMap(chainName, 'network', network)

    taskLogger.info('Provisioning storage for chain instance...')
    // create bootnode pvc
    await k8s.createPVC(chainName, 'bootnode', '2Mi')

    // create signer pvc
    for (const sealerAccount of sealerAccounts) {
      await k8s.createPVC(chainName, sealerAccount.sealerName, '200Mi')
    }
    taskLogger.info('Chain instance ready to deploy.')

    taskLogger.info(`Creating bootnode...`)
    // deploy boot node
    await createBootnodeService(chainName)
    await createBootnodeDeployment(chainName)

    taskLogger.info(`Creating sealer nodes...`)
    // deploy sealer nodes
    for (const sealerAccount of sealerAccounts) {
      await createSealerNodeDeployment(
        chainName,
        sealerAccount,
        chain.config
      )
    }

    taskLogger.info(`Creating transaction nodes...`)
    // deploy transaction nodes
    await createTransactionNodeService(chainName)
    await createTransactionNodeDeployment(chainName, transactionNodeCount)

    taskLogger.info('Waiting for all nodes to be online...')
    await k8s.waitAllPodsOnline(chainName, 5 * 60)
    taskLogger.info('All nodes online.')

    // taskLogger.info('Creating chain datastore agent...')
    // await createChainDatastoreAgentDeployment(chainName)
    // taskLogger.info('Waiting for datastore agent...')
    // await k8s.waitAllPodsOnline(chainName, 5*60)
    // taskLogger.info('Datastore agent online.')

    if (expose) {
      await createTransactionNodeServiceExternalName(chainName)
      const ingress = await k8s.getIngress()
      const rules = [...ingress.spec.rules]
      rules[0].http.paths.push({
        path: `/chain/${chainName}`,
        backend: {
          serviceName: `external-transaction-${chainName}`,
          servicePort: 8545
        }
      })
      await k8s.patchIngress({
        ...ingress,
        spec: { ...ingress.spec, rules }
      })
    } else {
      await k8s.createSecret(chainName, 'master-account', createMasterAccount())
    }

    const deployment = {
      namespace: chainName,
      createdOn: moment().valueOf()
    }
    await callDBGate('/chain/updateChainDeployment', { chainId, deployment })
    await callDBGate('/chain/updateChainStatus', {
      chainId,
      status: 'Deployed'
    })
  } catch (error) {
    try {
      await k8s.deleteNamespace(chainName)
    } catch (error) {
      console.log(error)
    }
    await callDBGate('/chain/updateChainStatus', { chainId, status: 'Failed' })

    throw error
  }
}
