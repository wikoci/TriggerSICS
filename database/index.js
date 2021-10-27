const Datastore = require("nedb-promises");
const moment = require("moment");
const db = {};
db.syncOnCreate = new Datastore({
  name: "OnCreate",
  filename: "./database/data/syncOnCreate.json",
  autoload: true,
  timestampData: true,
});

db.syncOnupdate = new Datastore({
  name: "OnUpdate",
  filename: "./database/data/syncOnUpdate.json",
  autoload: true,
  timestampData: true,
});

consola.success(" DataBase initialize ", db.syncOnCreate);

module.exports = { db };
