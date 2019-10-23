const BCCAPIGate = require("./BCCAPIGate");
const BCCData = require('./BCCData')
const BCCCache = require('./BCCCache')

const main = async () => {


  const apiServerPort = 5000;
  await BCCCache.connect()
  await BCCData.connect()
  await BCCAPIGate.startServer(apiServerPort);
  

};

main();
