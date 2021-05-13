const MongoClient = require('mongodb').MongoClient;
var url = "mongodb://mongo:27017";

const dbName = 'mydb';
const client = new MongoClient(url);

client.connect(function(err) {
  console.log("Connected successfully to server");

  const db = client.db(dbName);

  client.close();
});