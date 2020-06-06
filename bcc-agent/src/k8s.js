const moment = require('moment')
const k8s = require('@kubernetes/client-node')

const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const ingressName = 'bcc-ingress'

const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api)
const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api)
const k8sExtensionApi = kc.makeApiClient(k8s.ExtensionsV1beta1Api)

const wait = timeout =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve()
    }, timeout * 1000)
  })

const createNamespace = async namespaceName => {
  try {
    await k8sCoreV1Api.createNamespace({
      metadata: { name: namespaceName }
    })
  } catch (error) {
    console.log(error)
    throw new Error(`Failed to create namespace, ${error.body.message}.`)
  }
}

const deleteNamespace = async namespaceName => {
  try {
    await k8sCoreV1Api.deleteNamespace(namespaceName)
  } catch (error) {
    throw new Error(`Failed to delete namespace, ${error.body.message}.`)
  }
}

const createSecret = async (namespaceName, secretName, secretStringData) => {
  try {
    await k8sCoreV1Api.createNamespacedSecret(namespaceName, {
      metadata: { name: secretName },
      stringData: secretStringData
    })
  } catch (error) {
    console.log(error)
    throw new Error(`Failed to create secret, ${error.body.message}.`)
  }
}

const createConfigMap = async (namespaceName, configMapName, configMapData) => {
  try {
    await k8sCoreV1Api.createNamespacedConfigMap(namespaceName, {
      metadata: { name: configMapName },
      data: configMapData
    })
  } catch (error) {
    console.log(error)
    throw new Error(`Failed to create ConfigMap, ${error.body.message}.`)
  }
}

const createPVC = async (namespaceName, pvcName, storage) => {
  try {
    await k8sCoreV1Api.createNamespacedPersistentVolumeClaim(namespaceName, {
      metadata: { name: pvcName },
      spec: {
        storageClassName: 'default',
        accessModes: ['ReadWriteOnce'],
        resources: {
          requests: {
            storage
          }
        }
      }
    })
  } catch (error) {
    console.log(error)
    throw new Error(`Failed to create PVC, ${error.body.message}.`)
  }
}

const getIngress = async () => {
  const res = await k8sExtensionApi.readNamespacedIngress(
    ingressName,
    'default'
  )
  return res.body
}

const patchIngress = async body => {
  const res = await k8sExtensionApi.patchNamespacedIngress(
    ingressName,
    'default',
    body,
    undefined,
    undefined,
    {
      headers: {
        'Content-Type': 'application/merge-patch+json'
      }
    }
  )
  return res
}

const waitAllPodsOnline = async (namespaceName, timeout) => {
  const startTime = moment().unix()
  let podList = []
  while (moment().unix() - startTime < timeout) {
    await wait(2)
    console.log(`Checking pods status...`)
    const currentPodList = await k8sCoreV1Api.listNamespacedPod(
      namespaceName,
      true
    )
    podList = currentPodList.body.items.map(pod => {
      return { name: pod.metadata.name, status: pod.status.phase }
    })
    console.log(podList)
    const notReadyPods = podList.filter(pod => pod.status !== 'Running')
    if (notReadyPods.length === 0) {
      console.log(`All pods online and running.`)
      break
    }
  }
  return podList.map(pod => {
    return { name: pod.name }
  })
}

const waitNamespaceDeleted = async (namespaceName, timeout) => {
  const startTime = moment().unix()
  let status = ''
  while (moment().unix() - startTime < timeout) {
    await wait(2)
    try {
      const res = await k8sCoreV1Api.readNamespaceStatus(namespaceName)
      status = res.body.status.phase
      console.log(`Namespace ${namespaceName} status: ${status}`)
    } catch (error) {
      if (error.response.statusCode === 404) {
        status = 'Deleted'
        console.log(`Namespace ${namespaceName} status: ${status}`)
        break
      } else {
        console.log(
          `${error.response.statusCode}. ${error.response.body.message}`
        )
      }
    }
  }
  if (status !== 'Deleted')
    throw new Error('Wait for namespace delete timeout.')
}

const getChainMasterAccount = async (namespaceName) => {
  try {
    const res = await k8sCoreV1Api.readNamespacedSecret('master-account', namespaceName)
    const addrBuff = new Buffer(res.body.data.address, 'base64')
    const privateKeyBuff = new Buffer(res.body.data.privateKey, 'base64')
    return {
      account : addrBuff.toString('ascii'),
      privateKey: privateKeyBuff.toString('ascii')
    }
  } catch (error) {
    throw error
  }
}


module.exports = {
  k8sCoreV1Api,
  k8sAppV1Api,
  createNamespace,
  deleteNamespace,
  createSecret,
  createConfigMap,
  createPVC,
  waitAllPodsOnline,
  waitNamespaceDeleted,
  getIngress,
  patchIngress,
  getChainMasterAccount,
}
