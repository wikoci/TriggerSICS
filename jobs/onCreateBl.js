const moment = require("moment");
const consola = require("consola");
const sql = require("mssql");
const fs = require("fs");
const fetch = require("node-fetch");
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
      if (err) {
        process.exit(1);
        return false;
      }

      var date = moment().add("0", "day");
      var current = moment(date).format("YYYY-MM-DD hh:mm:ss");
      var latestCron = await db.syncOnCreate
        .findOne({}, { createdAt: 1, _id: 1, last_time: 1 })
        .sort({ createdAt: -1 })
        .limit(1)
        .then((e) => e);

      console.log("Latser Cron", latestCron);

      var latest_date = latestCron.last_time || current;

      latest_date = moment(latest_date).format("YYYY-MM-DD hh:mm:ss");

      console.log("Latest date: " + latest_date);
      const request = new sql.Request();
      //   request.stream = true // You can set streaming differently for each request
      var response = await request.query(`
 select CT_Num as code_client,do_piece as code_bl,ar_ref as code_article,dl_qte,dl_ligne,dl_poidsnet,
 dl_montantht,dl_montantttc,do_Date,cbmodification 
  from F_DOCLIGNE 
  where DO_Date > '${latest_date}' 
  and do_type in (1,3) 
  and f_comptet.co_no >= 42 
and f_comptet.co_no not in ('46','47')
and CT_Intitule like 'VDR%'
  
  `); // or request.execute(procedure)

      console.log(response);

      const init =
        {
          action: "update",
          data: response.recordset,
          data: latest_date,
        } || {};

      console.log(latest_date, response.recordset.length);

      fs.writeFileSync(
        __dirname + "/bl.json",
        JSON.stringify(response.recordset),
        "utf8"
      );
      //console.log(response.recordset);

      fetch("https://api.esavoo.com/automates/sics", {
        method: "POST",
        body: JSON.stringify(init),
      })
        .then(() => {
          // If all are done
          db.syncOnCreate.insert({
            last_time: moment().format("YYYY-MM-DD hh:mm:ss"),
          });
        })
        .catch((err) => {
          console.log(err);
        });

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
    process.exit(1);
  }
}

console.log("Cron is running after 5min Trigger Oncreate");
onCreateBl(); // Event on create entry
