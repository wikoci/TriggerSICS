const express = require("express");
const consola = require("consola");

const app = express();
const Bree = require("bree");
const path = require("path");
global.moment = require("moment");
require("./database"); // Init database
async function main() {
  const bree = new Bree({
    interval: "5m",
    jobs: [
      {
        name: "onCreateBl",
        // interval: "30s",
        timeout: false,
      },
    ],
    errorHandler: (error, workerMetadata) => {
      // workerMetadata will be populated with extended worker information only if
      // Bree instance is initialized with parameter `workerMetadata: true`
      if (workerMetadata.threadId) {
        console.log(
          `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
        );
      } else {
        console.log(
          `There was an error while running a worker ${workerMetadata.name}`
        );
      }
    },
  });

  bree.start(); /// Start bree
  consola.success("********************* Bree is running ***************");
}

main(); // Start man program

app.listen(5000, () => {
  console.log("\n");
});
