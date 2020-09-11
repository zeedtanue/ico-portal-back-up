"use strict";

const error_messages = {

	internal: {
		status_code	: 'E_500',
		message 	: 'Internal server error.'
	},
	login_failed: {
		status_code	: 'E_001',
		message 	: 'Login failed.'
	},
	validation_failed: {
		status_code	: 'E_002',
		message 	: 'Validation failed.'
	},
	email_already_registered: {
		status_code	: 'E_003',
		message 	: 'Email is already registered.'
	},
	email_not_verified: {
		status_code	: 'E_004',
		message 	: 'Email not verified.'
	},
	user_not_found: {
		status_code	: 'E_005',
		message 	: 'User not found.'
	},
	email_verification_failed: {
		status_code : 'E_006',
		message 	: 'Email verification failed.'
	},
	invalid_captcha: {
		status_code	: 'E_007',
		message 	: 'Invalid captcha.'
	},
	captcha_verf_failed: {
		status_code	: 'E_008',
		message 	: 'Captcha verification failed.'
	},
	invalid_ico_id: {
		status_code	: 'E_009',
		message 	: 'Invalid ICO id provided.'
	},
	ico_not_found: {
		status_code	: 'E_010',
		message 	: 'No ICO found.'
	},
	filename_not_found: {
		status_code	: 'E_011',
		message		: 'Filename not found in request.'
	},
	image_not_found: {
		status_code	: 'E_012',
		message 	: 'Image not found.'
	},
	ico_data_not_found: {
		status_code	: 'E_013',
		message		: 'ICO data not found.'
	},
	ico_update_failed: {
		status_code	: 'E_014',
		message		: 'ICO update failed'
	},
	access_denied: {
		status_code	: 'E_014',
		message		: 'Access denied.'
	},
	details_missing: {
		status_code	: 'E_015',
		message		: 'Request missing required details.'
	},
	invalid_request: {
		status_code	: 'E_016',
		message		: 'Invalid request.'
	}
}

const success_messages = {

	user_registered : {
		status_code	: 'S_001',
		message 	: 'User successfully registered.'
	},
	ico_created: {
		status_code	: 'S_002',
		message		: 'New ICO successfully created.'
	},
	image_deleted: {
		status_code	: 'S_003',
		message 	: 'Image successfully deleted.'
	},
	ico_updated: {
		status_code	: 'S_004',
		message 	: 'ICO Successfully crated.'
	},
	file_uploaded: {
		status_code	: 'S_005',
		message		: 'File successfully uploaded.'
	},
	ico_saved: {
		status_code	: 'S_006',
		message		: 'ICO data successfully saved.'
	},
	ico_status_updated: {
		status_code	: 'S_007',
		message 	: 'ICO status updated.'
	}
}

module.exports = {
	error 	: error_messages,
	success : success_messages
}