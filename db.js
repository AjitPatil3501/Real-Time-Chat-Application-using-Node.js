const { MongoClient } = require('mongodb');

const url = 'mongodb://127.0.0.1:27017/';
const dbName = 'chatapp';

let db;

async function connect() {
  const client = await MongoClient.connect(url);
  db = client.db(dbName);
}

function collection(name) {
  return db.collection(name);
}

module.exports = {
  connect,
  collection,
};
