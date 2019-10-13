const create = (options)=>{
  const {name, data} = options
  return {
    apiVersion: 'v1',
    kind: 'ConfigMap',
    metadata: {
      name,
    },
    data,
  }
}

module.exports={
  create,
}