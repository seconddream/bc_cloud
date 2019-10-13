const k8s = require('@kubernetes/client-node')

const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sCoreV1Api =  kc.makeApiClient(k8s.CoreV1Api)
const k8sAppV1Api = kc.makeApiClient(k8s.AppsV1Api)

module.exports = {
  k8sCoreV1Api,
  k8sAppV1Api,
}
