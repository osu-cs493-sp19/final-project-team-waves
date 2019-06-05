/*
 * Module for working with a MongoDB connection.
 */

const { MongoClient } = require('mongodb');

const mongoHost = process.env.MONGO_HOST;
const mongoPort = process.env.MONGO_PORT || 27017;
const mongoUser = process.env.MONGO_USER;
const mongoPassword = process.env.MONGO_PASSWORD;
const mongoDBName = process.env.MONGO_DATABASE;

const mongoUrl = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}/${mongoDBName}`;

let db = null;

exports.connectToDB = () => {
  return new Promise((res, rej) => {
    MongoClient.connect(mongoUrl, { useNewUrlParser: true }, (err, client) => {
      if (err)
        rej(err);
      
      else {
        db = client.db(mongoDBName);
        res();
      }
    });
  });
};

exports.getDBReference = function () {
  return db;
};