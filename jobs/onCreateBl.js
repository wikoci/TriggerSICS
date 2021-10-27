const moment = require("moment");
const consola = require("consola");
const sql = require("mssql");
const { db } = require("../database/index");
const { DB_CONFIG } = require("../config");
const sqlConfig = {
  ...DB_CONFIG,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

async function onCreateBl() {
  console.log("Start mssql ");
  try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig, async (err) => {
      err ? console.log(err?.originalError) : "";

      var date = moment().add("0", "day");
      var current = moment(date).format("YYYY-MM-DD");
      var latestCron = db.syncOnCreate
        .findOne({}, { createdAt: 1, _id: 1, last_time: 1 })
        .sort({ createdAt: -1 })
        .limit(1)
        .then((e) => e);

      var latest_date = latestCron.last_time || current;

      const request = new sql.Request();
      //   request.stream = true // You can set streaming differently for each request
      var response = await request.query(`
 select CT_Num as code_client,do_piece as code_bl,ar_ref as code_article,dl_qte,dl_poidsnet,dl_montantht,dl_montantttc,do_Date,cbmodification 
  from F_DOCLIGNE 
  where DO_Date > '${latest_date}'`); // or request.execute(procedure)

      console.log(response);

      db.syncOnCreate.insert({ last_time: moment().toDate() });

      request.on("done", (result) => {
        // Always emitted as the last one

        console.log("Done");
      });
    });
    // const result = await sql.query`select * from mytable where id = ${value}`
    // console.dir(result)
  } catch (err) {
    // ... error checks

    console.log("Error to connect", err);
  }
}

//onCreateBl(); // Event on create entry
