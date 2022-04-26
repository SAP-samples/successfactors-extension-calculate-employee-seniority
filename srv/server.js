"use strict";

const cds = require("@sap/cds");
const cors = require("cors");
const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const prometheus = require('prom-client');

cds.on("bootstrap", app => {
  app.use(proxy());
  app.use(cors());
  app.get('/metrics', async function (req, res) {
    try {
      res.set('Content-Type', prometheus.register.contentType);
      res.end(await prometheus.register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });
});

module.exports = cds.server;
