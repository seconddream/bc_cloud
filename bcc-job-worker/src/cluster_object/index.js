const ChainDeployment = require('./chain_deployment')
const Namespace = require('./namespace')
const Secret = require('./secret')
const PersistentVolumeClaim = require('./presistent_volume_claim')
const ConfigMap = require('./config_map')

module.exports = {
  ChainDeployment,
  Namespace,
  Secret,
  PersistentVolumeClaim,
  ConfigMap
}