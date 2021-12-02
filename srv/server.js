"use strict";

const cds = require("@sap/cds");
const cors = require("cors");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");

cds.on("bootstrap", app => {
  app.use(proxy());
  app.use(cors());
});

module.exports = cds.server;
