const create = (options)=>{
  const { name, stringData } = options
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      name,
    },
    type: 'Opaque',
    stringData,
  }
}

module.exports = {
  create,
}