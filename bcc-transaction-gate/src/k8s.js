const k8s = require('@kubernetes/client-node')
const kc = new k8s.KubeConfig()
kc.loadFromDefault()

const k8sCoreV1Api = kc.makeApiClient(k8s.CoreV1Api)

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
  getChainMasterAccount,
}
