"use strict";

const cds = require("@sap/cds");
const cors = require("cors");
//const allowList = ['https://platform.appgyver.com', 'https://preview.appgyver.com'];

/*
const corsOptions = {
  origin: function (origin, callback) {
    if (allowList.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
};
*/

//cds.on("bootstrap", app => app.use(cors(corsOptions)));
cds.on("bootstrap", app => app.use(cors()));

module.exports = cds.server;
