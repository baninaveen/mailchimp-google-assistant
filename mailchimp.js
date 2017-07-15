var api_key, Mailchimp_SDK, mailchimp_api, distribution_lists 

var MailChimp = function(api_key) {
    Mailchimp_SDK = require('mailchimp-api-v3')
    mailchimp_api = new Mailchimp_SDK(api_key);
}

/**
 * Creates a new email marketing campaign in the user's MailChimp account
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.createCampaign = function (list_name, error_callback, success_callback) {
    console.log('creating campaign for list name: ' + list_name)
    if(distribution_lists != null) {
        list_to_send_to = distribution_lists.find(function(list) {
            return list.name === list_name;
        })
        console.log('creating campaign for list id: ' + list_to_send_to.id)
        mailchimp_api.post('campaigns', {
            "recipients":{"list_id":`${list_to_send_to.id}`},
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
    } else {
        console.log('distribution_lists has not been populated')
        error_callback('distribution_lists has not been populated')
    }
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

/**
 * Gets a list of the distribution lists in the user's MailChimp account
 * @param {Function} error_callback
 * @param {Function} success_callback
 */
MailChimp.prototype.getLists = function (error_callback, success_callback) {
    console.log('looking for lists..')
    mailchimp_api.get('lists')
    .then(function(results) {
      console.log('lists found');
      distribution_lists = results.lists;
      success_callback(results.lists)
    })
    .catch(function (err) {
      console.log('error');
      error_callback(err)
    })
}


module.exports = MailChimp
