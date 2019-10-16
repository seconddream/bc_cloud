const MongoClient = require("mongodb").MongoClient;

let client = null
const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const connetToMongo = (host, port) =>
  new Promise((resolve, reject) => {
    const url =
      "mongodb://" +
      `${encodeURI(db_username)}:${encodeURI(db_password)}@${host}:${port}/` +
      "?authMechanism=DEFAULT";
    MongoClient.connect(url, (error, newClient)=>{
      if(error){
        reject(error)
      }else{
        client = newClient
        resolve()
      }

    })
    
  });

  module.exports = {
    connetToMongo
  }