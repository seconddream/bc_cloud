const create = (options)=>{
  const {storage, name} = options
  return {
    apiVersion: 'v1',
    kind: 'PersistentVolumeClaim',
    metadata:{
      name,
    },
    spec: {
      accessModes: ['ReadWriteOnce'],
      storageClassName: 'hostpath',
      resources:{
        requests: {
          storage,
        }
      }
    }
  }
}

module.exports = {
  create,
}
