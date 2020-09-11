const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_DB_URL ,{dbName: process.env.MONGO_DB_NAME });
let conn = mongoose.connection;

module.exports = {
	mongo_conn : conn
}