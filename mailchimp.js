var api_key, Mailchimp_SDK, mailchimp_api 

var MailChimp = function(api_key) {
    if(api_key === null) {
       api_key = process.env.MAILCHIMP_API_KEY; 
   }
    Mailchimp_SDK = require('mailchimp-api-v3')
    mailchimp_api = new Mailchimp_SDK(api_key);
}

/**
 * Creates a new email marketing campaign in the user's MailChimp account
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.createCampaign = function (error_callback, success_callback) {
    console.log('creating campaign..')
      mailchimp_api.post('campaigns', {
        "recipients":{"list_id":"00ea6e084d"},
        "type":"regular",
        "settings":{
          "subject_line":"Your Purchase Receipt",
          "reply_to":"ckirksey3@gmail.com",
          "from_name":"Customer Service"
        }
      })
      .then(function(results) {
          console.log('campaign created');
          console.log(results);
          success_callback(results.id)
      })
      .catch(function (err) {
          console.log('error');
          error_callback(err)
      })
}

/**
 * Edits an existing email marketing campaign in the user's MailChimp account
 * @param {String} campaign_id
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.editCampaign = function (campaign_id, error_callback, success_callback) {
    console.log('editing campaign..')
    mailchimp_api.put(`campaigns/${campaign_id}/content`, {
      'html': '<p>The HTML to use for the saved campaign<./p>'
    })
    .then(function(results) {
      console.log('campaign edited');
      console.log(results);
      success_callback(campaign_id)
    })
    .catch(function (err) {
      console.log('error');
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
    console.log('sending campaign with id: ' + campaign_id)
    mailchimp_api.post(`campaigns/${campaign_id}/actions/send`)
    .then(function(results) {
      console.log('campaign sent');
      console.log(results);
      success_callback(results)
    })
    .catch(function (err) {
      console.log('error');
      error_callback(err)
    })
}


module.exports = MailChimp
