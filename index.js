'use strict';

process.env.DEBUG = 'actions-on-google:*';
let ApiAiApp = require('actions-on-google').ApiAiApp;

let express = require('express');
let bodyParser = require('body-parser');

let Mailchimp = require('./mailchimp.js')
let mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY)

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const CREATE_CAMPAIGN = 'create.campaign';
const LIST_SELECTED = "list.selected";
const EMAIL_BODY_GIVEN = "email.body.given";

var last_question_asked;
var current_campaign_id;

// API.AI parameter names
const CATEGORY_ARGUMENT = 'category';

app.post('/', function (request, response) {
  const assistant = new ApiAiApp({request: request, response: response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  /**
   * Creates a new email marketing campaign in the user's MailChimp account
   * @param {Function} error_callback
   * @param {Function} success_callback
   */
  function handleCampaignSend() {
    assistant.tell('Congrats! We sent the campaign');
    return;
  }

  function handleError(error) {
    console.log(error)
    assistant.tell('Sorry, something went wrong');
    return;
  }

  function handleCampaignEdit(campaign_id) {
    mailchimp.sendCampaign(campaign_id, handleError, handleCampaignSend);
    return;
  }

  function handleCampaignCreation(campaign_id) {
    current_campaign_id = campaign_id;
    assistant.ask('What should we say in the email?');
    return;
  }

  function handleEmailBodyGiven() {
    let email_body = assistant.getRawInput();
    mailchimp.editCampaign(email_body, current_campaign_id, handleError, handleCampaignEdit)
    return;
  }

  function handleListSelection() {
    let answer = assistant.getSelectedOption();
    if(last_question_asked == 'which_list_to_send_to') {
      mailchimp.createCampaign(answer, handleError, handleCampaignCreation);
    }
    return;
  }

  function createAndSendCampaign (assistant) {
      mailchimp.getLists(handleError, function(lists) {
        if(lists.length < 1) {
          assistant.tell('You need to create a list in MailChimp before we can send a campaign');
        }
        else if(lists.length == 1) {
          mailchimp.createCampaign(lists[0].id, handleError, handleCampaignCreation);
        } else {
          let list_items = lists.map(function(list){
            return assistant.buildOptionItem(list.id)
              .setTitle(list.name)
          });
          assistant.askWithList('Which list should we send the campaign to?',
          assistant.buildList('MailChimp Lists')
           .addItems(list_items));
          last_question_asked = 'which_list_to_send_to';
        }
      });
  }

  let actionMap = new Map();
  actionMap.set(CREATE_CAMPAIGN, createAndSendCampaign);
  actionMap.set(LIST_SELECTED, handleListSelection);
  actionMap.set(EMAIL_BODY_GIVEN, handleEmailBodyGiven);
  assistant.handleRequest(actionMap);
});

if (module === require.main) {
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;
