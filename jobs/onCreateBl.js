const moment = require("moment");
const consola = require("consola");
const sql = require("mssql");
const { db } = require("../database/index");
const sqlConfig = {
  user: "",
  password: "",
  database: "",
  server: "",
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
      console.log(current);

      const request = new sql.Request();
      //   request.stream = true // You can set streaming differently for each request
      var response = await request.query(`
 select CT_Num as code_client,do_piece as code_bl,ar_ref as code_article,dl_qte,dl_poidsnet,dl_montantht,dl_montantttc,do_Date,cbmodification 
  from F_DOCLIGNE 
  where DO_Date > '${current}'`); // or request.execute(procedure)

      console.log(response);

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

onCreateBl(); // Event on create entry
var latestDate = db.syncOnCreate
  .find({})
  .sort({ createdAt: 1 })
  .limit(1)
  .then((e) => {
    console.log(e);
  });
