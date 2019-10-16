const create = (options)=>{
  const { chainName, signers, nonSigners } = options
  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: `${chainName}-chain`,
      labels: {
        component: `${chainName}-chain`,
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          component: `${chainName}-chain`,
        },
      },
      template:{
        metadata:{
          labels:{
            component: `${chainName}-chain`,
          },
        },
        spec: {
          volumes: [
            {
              name: `network-config`,
              configMap: {
                name: `network-config`
              }
            },
            {
              name: `bootnode-data`,
              persistentVolumClaim: {
                claimName: 'bootnode-data',
              },
            },
            ...[...Array(signerAccounts.length + nonSignerCount).keys()].map(index=>{
              return {
                name: `node${index}-data`,
                persistentVolumClaim: {
                  claimName: `node${index}-data`,
                }
              }
            }),
          ],
          containers: [
            // bootnode
            {
              name: 'bootnode',
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                'bootnode --nodekey=/bcc/bootnode-data/node.key --verbosity=4'
              ],
              ports: [
                {
                  name: 'discovery',
                  containerPort: 30301,
                  protocol: 'UDP',
                },
              ],
              volumeMounts: [
                {
                  name: `bootnode-data`,
                  mountPath: '/bcc/bootnode-data',
                },
                ...signerAccounts.map((account, index)=>{
                  return {
                    name: `node${index}-data`,
                    mountPath: `/bcc/node${index}-data`,
                  }
                }),
              ],
            },
            // signer node
            ...signers.map((signer, index)=>{
              return {
                name: `node-${index}`,
                image: 'ethereum/client-go:alltools-latest',
                imagePullPolicy: 'IfNotPresent',
                command: ['/bin/sh'],
                args: [
                  '-c',
                  `geth \
                    --datadir /bcc/node${index}-data --bootnodes=\`cat /bcc/bootnode-data/bootnodeAddress.txt\` \
                    --port $(PORT) \
                    --unlock $(ACCOUNT) --password /bcc/node${index}-data/signer_password.txt \
                    --networkid \`cat /bcc/network-config/networkId\` \
                    --gasprice "0" --mine`
                ],
                ports: [
                  
                ],
                env: [
                  {
                    name: 'PASSWORD',
                    valueFrom: {
                      secretKeyRef: {
                        name: `signer${index}-secret`,
                        key: 'password'
                      }
                    }
                  },
                  {
                    name: 'PORT',
                    valueFrom: {
                      secretKeyRef: {
                        name: `signer${index}-secret`,
                        key: 'port'
                      }
                    }
                  },
                  {
                    name: 'RPC_PORT',
                    valueFrom: {
                      secretKeyRef: {
                        name: `signer${index}-secret`,
                        key: 'rpc_port'
                      }
                    }
                  },
                  {
                    name: 'ACCOUNT',
                    valueFrom: {
                      secretKeyRef: {
                        name: `signer${index}-secret`,
                        key: 'account'
                      }
                    }
                  },

                ],
                volumeMounts: [
                  {
                    name: `bootnode-data`,
                    mountPath: '/bcc/bootnode-data',
                  },
                  {
                    name: `node${index}-data`,
                    mountPath: `/bcc/node${index}-data`,
                  },
                  {
                    name: `network-config`,
                    mountPath: '/bcc/network-config',
                  },
                ],
              }
            })
          ],
          initContainers: [
            // bootnode generate key
            {
              name: 'bootnode-genkey',
              image: 'ethereum/client-go:alltools-latest',
              imagePullPolicy: 'IfNotPresent',
              command: ['/bin/sh'],
              args: [
                '-c',
                'bootnode --genkey=/bcc/bootnode-data/node.key && \
                  echo "enode://$(bootnode -writeaddress --nodekey=/bcc/bootnode-data/node.key)@127.0.0.1:30301" \
                  >> /bcc/bootnode-data/bootnodeAddress.txt && \
                  cat /bcc/bootnode-data/bootnodeAddress.txt'
              ],
              volumeMounts: [
                {
                  name: `bootnode-data`,
                  mountPath: '/bcc/bootnode-data',
                },
              ],
            },
            // import signer account for each node and init with genesis block
            ...signerAccounts.map((account, index)=>{
              return {
                name: `node${index}-init`,
                image: 'ethereum/client-go:alltools-latest',
                imagePullPolicy: 'IfNotPresent',
                command: ['/bin/sh'],
                args: [
                  '-c',
                  `echo "$(PRIVATE_KEY)" > /bcc/node${index}-data/signer_private_key.txt && \
                    echo "$(PASSWORD)" > /bcc/node${index}-data/signer_password.txt && \
                    printf "$(PASSWORD)\n$(PASSWORD)\n" | geth --datadir /bcc/node${index}-data account import /bcc/node${index}-data/signer_private_key.txt && \
                    geth --datadir /bcc/node${index}-data init /bcc/network-config/genesis \
                    rm /bcc/node${index}-data/signer_private_key.txt`
                ],
                env: [
                  {
                    name: 'PASSWORD',
                    valueFrom: {
                      secretKeyRef: {
                        name: `signer${index}-secret`,
                        key: 'password'
                      }
                    }
                  },
                  {
                    name: 'PRIVATE_KEY',
                    valueFrom: {
                      secretKeyRef: {
                        name: `signer${index}-secret`,
                        key: 'private_key'
                      }
                    }
                  },

                ],
                volumeMounts: [
                  {
                    name: `node${index}-data`,
                    mountPath: `/bcc/node${index}-data`,
                  },
                  {
                    name: `network-config`,
                    mountPath: '/bcc/network-config',
                  },
                ],
              }
            }),
          ],
        }
      }
    }
  }
}


module.exports = {
  create,
}