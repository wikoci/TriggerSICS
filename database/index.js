const Datastore = require("nedb-promises");

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

db.syncOnCreate
  .findOne({}, { createdAt: 1, _id: 1, last_time: 1 })
  .sort({ createdAt: 1 })
  .limit(1)
  .then((e) => {
    console.log(e);
  });

module.exports = { db };
