const express = require("express");
const consola = require("consola");
const app = express();
const Bree = require("bree");
const path = require("path");
global.moment = require("moment");
require("./database"); // Init database
async function main() {
  const bree = new Bree({
    jobs: [
      {
        name: "onCreateBl",
        interval: "30s",
        timeout: "1s",
      },
    ],
  });

  bree.start(); /// Start bree
  consola.success("********************* Bree is running ***************");
}

main(); // Start man program

app.listen(5000, () => {
  console.log("\n");
});
