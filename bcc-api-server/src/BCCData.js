const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;

const db_username = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;

const mongoHost = "bcc-db.default.svc.cluster.local";
const mongoPort = 27017;

let BCCDatalient = null;

let db = null;
let chainCollection = null;
let userCollection = null;

const wait = timeout =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout * 1000);
  });

const connect = async () => {
  const timeout = 5 * 60;
  const url =
    "mongodb://" +
    `${encodeURI(db_username)}:${encodeURI(
      db_password
    )}@${mongoHost}:${mongoPort}/` +
    "?authMechanism=DEFAULT";

  const startTime = Date.now();
  while (true) {
    if (Date.now() - startTime > timeout * 1000) {
      throw new Error("Connect to mongo time out.");
    }
    try {
      console.log(`Connecting to mongo at ${mongoHost}:${mongoPort}...`);
      BCCDatalient = new MongoClient(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true
      });
      await BCCDatalient.connect();
      break;
    } catch (error) {
      await wait(1);
    }
  }
  db = BCCDatalient.db("bcc-db");
  chainCollection = db.collection("chain");
  userCollection = db.collection("user");
  console.log(`Connected to mongo at ${mongoHost}:${mongoPort}`);
};

const writeUser = async (email, accountAddr, keystore) => {
  let existUserDocs = await userCollection.find({ email }).toArray();
  if (existUserDocs.length > 0) {
    throw new Error("User email exists.");
  }
  existUserDocs = await userCollection.find({ accountAddr }).toArray();
  if (existUserDocs.length > 0) {
    throw new Error("Account address taken.");
  }
  const createUserResult = await userCollection.insertOne({
    email,
    accountAddr,
    keystore,
    userChainList: []
  });
  return createUserResult.insertedId;
};

const readUserByEmail = async email => {
  const userDoc = await userCollection
    .find({ email }, { projection: { _id: 0, keystore: 1 } })
    .toArray();
  console.log(userDoc);
  if (userDoc.length === 0) {
    throw new Error("User not found.");
  }
  return userDoc[0];
};

const readUserById = async id => {
  const userDoc = await userCollection
    .find(
      { _id: new ObjectID(id) },
      { projection: { _id: 0, accountAddr: 0, keystore: 0 } }
    )
    .toArray();
  if (userDoc.length === 0) {
    throw new Error("User not found.");
  }
  userDoc[0].id = id;
  return userDoc[0];
};

const deleteUser = async id => {
  const deleteUserResult = await userCollection.findOneAndDelete({
    _id: new ObjectID(id)
  });
  if (!deleteUserResult.value) {
    throw new Error("User not found.");
  }
};

const writeChain = async (owner, name, type) => {
  const existUserDocs = await userCollection.find({ accountAddr: owner }).toArray();
  if (existUserDocs.length === 0) {
    throw new Error("User is associated with the owner account.");
  }
  const existChain = await chainCollection.find({ name }).toArray();
  if (existChain.length > 0) {
    throw new Error("Chain name exists.");
  }
  const createChainResult = await chainCollection.insertOne({
    owner,
    name,
    type,
    signerCount: null,
    nonSignerCount: null,
    gasPrice: null
  });
  
  await userCollection.findOneAndUpdate(
    {accountAddr: owner}, {$push: {userChainList: createChainResult.insertedId}}
  )
  
  return createChainResult.insertedId;
};

const readChainById = async (id) => {
  const chainDocs = await chainCollection.find({_id: new ObjectID(id)}).toArray()
  if(chainDocs.length === 0){
    throw new Error('Chain not found.')
  }
  return chainDocs[0]
}

module.exports = {
  connect,
  writeUser,
  readUserById,
  readUserByEmail,
  deleteUser,
  writeChain,
  readChainById
};
