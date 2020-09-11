"use strict";

const redis = require('redis');
const client = redis.createClient(6379, "icotest.xc86zn.ng.0001.use2.cache.amazonaws.com");

module.exports = client;