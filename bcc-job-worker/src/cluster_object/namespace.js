const create = options => {
  const { name } = options;
  return {
    metadata: {
      name,
    }
  };
};


module.exports = {
  create,
}
