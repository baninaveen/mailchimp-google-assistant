var api_key, Mailchimp_SDK, mailchimp_api

var MailChimp = function(api_key) {
    Mailchimp_SDK = require('mailchimp-api-v3')
    mailchimp_api = new Mailchimp_SDK(api_key);
}

/**
 * Creates a new email marketing campaign in the user's MailChimp account
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.createCampaign = function (list_id, error_callback, success_callback) {
    mailchimp_api.post('campaigns', {
        "recipients":{"list_id":`${list_id}`},
        "type":"regular",
        "settings":{
          "subject_line":"Update",
          "reply_to":"ckirksey3@gmail.com",
          "from_name":"Customer Service"
    }
    })
    .then(function(results) {
      success_callback(results.id)
    })
    .catch(function (err) {
      error_callback(err)
    })
}

/**
 * Edits an existing email marketing campaign in the user's MailChimp account
 * @param {String} campaign_id
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.editCampaign = function (email_body, campaign_id, error_callback, success_callback) {
    mailchimp_api.put(`campaigns/${campaign_id}/content`, {
      'html': `<p>${email_body}<./p>`
    })
    .then(function(results) {
      success_callback(campaign_id)
    })
    .catch(function (err) {
      error_callback(err)
    })
}

/**
 * Sends an email marketing campaign in the user's MailChimp account
 * @param {String} campaign_id
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.sendCampaign = function (campaign_id, error_callback, success_callback) {
    mailchimp_api.post(`campaigns/${campaign_id}/actions/send`)
    .then(function(results) {
      success_callback()
    })
    .catch(function (err) {
      error_callback(err)
    })
}

/**
 * Gets a list of the distribution lists in the user's MailChimp account
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.getLists = function (error_callback, success_callback) {
    mailchimp_api.get('lists')
    .then(function(results) {
      success_callback(results.lists)
    })
    .catch(function (err) {
      error_callback(err)
    })
}


module.exports = MailChimp
