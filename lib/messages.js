"use strict";

const error_messages = {

    internal: {
        status_code: 'E_500',
        message: 'Internal server error.'
    },
    login_failed: {
        status_code: 'E_001',
        message: 'Email or password incorrect.'
    },
    validation_failed: {
        status_code: 'E_002',
        message: 'Validation failed.'
    },
    email_already_registered: {
        status_code: 'E_003',
        message: 'User with this email already exist.'
    },
    email_not_verified: {
        status_code: 'E_004',
        message: 'Email not verified.'
    },
    user_not_found: {
        status_code: 'E_005',
        message: 'User not found.'
    },
    email_verification_failed: {
        status_code: 'E_006',
        message: 'Email verification failed.'
    },
    invalid_captcha: {
        status_code: 'E_007',
        message: 'Invalid captcha.'
    },
    captcha_verf_failed: {
        status_code: 'E_008',
        message: 'Captcha verification failed.'
    },
   
    filename_not_found: {
        status_code: 'E_011',
        message: 'Filename not found in request.'
    },
    image_not_found: {
        status_code: 'E_012',
        message: 'Image not found.'
    },
   
    access_denied: {
        status_code: 'E_014',
        message: 'Access denied.'
    },
    details_missing: {
        status_code: 'E_015',
        message: 'Request missing required details.'
    },
    invalid_request: {
        status_code: 'E_016',
        message: 'Invalid request.'
    },
   
    link_not_found: {
        status_code: 'E_019',
        message: 'Request not contain link.'
    },
    fields_not_found: {
        status_code: 'E_020',
        message: 'Fields not found.'
    },
    field_already_exist: {
        status_code: 'E_021',
        message: 'Field already exist.'
    },
    invalid_input_type: {
        status_code: 'E_022',
        message: 'Invalid input type'
    },
    item_not_found: {
        status_code: 'E_023',
        message: 'Item not found.'
    },
    email_not_found_req: {
        status_code: 'E_024',
        message: 'Request not contain email address.'
    },
    token_type_already_exist: {
        status_code: 'E_025',
        message: 'Token standard already exist.'
    },
    token_type_not_found: {
        status_code: 'E_026',
        message: 'Token standard not found.'
    },
    email_already_verified: {
        status_code: 'E_027',
        message: 'User email already verified.'
    },
    cannot_upload: {
        status_code: 'E_028',
        message: 'Coudn\'t upload the file'
    },
    invalid_file:{
        status_code: 'E_029',
        message: 'Invalid file type'
    },
    file_not_found:{
        status_code: 'E_030',
        message: 'File not found'
    }
}

const success_messages = {

    user_registered: {
        status_code: 'S_001',
        message: 'User successfully registered.'
    },
    image_deleted: {
        status_code: 'S_003',
        message: 'Image successfully deleted.'
    },
    file_uploaded: {
        status_code: 'S_005',
        message: 'File successfully uploaded.'
    },
    new_item_added: {
        status_code: 'S_008',
        message: 'New item successfully added.'
    },
    item_price_updated: {
        status_code: 'S_009',
        message: 'Item price successfully updated.'
    },
    item_removed: {
        status_code: 'S_010',
        message: 'Item successfully removed.'
    },
    user_removed: {
        status_code: 'S_011',
        message: 'User successfully removed.'
    },
    token_type_added: {
        status_code: 'S_012',
        message: 'Token standard successfully added.'
    },
    token_type_removed: {
        status_code: 'S_013',
        message: 'Token standard successfully removed.'
    },
    verf_email_re_sent: {
        status_code: 'S_016',
        message: 'Verification email re-sent.'
    }
}

module.exports = {
    error: error_messages,
    success: success_messages
}