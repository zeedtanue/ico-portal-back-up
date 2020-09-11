"use strict";
const logger = require('./logger');

const handler = promise => {

	return promise
		.then(data => {

			return {err: null, data};
		})
		.catch(err => {
			logger.error(err);
			return {err, data: null};
		});

};

module.exports = handler;