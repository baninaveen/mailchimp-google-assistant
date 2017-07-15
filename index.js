'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;

let express = require('express');
let bodyParser = require('body-parser');

let Mailchimp = require('./mailchimp.js')
let mailchimp = new Mailchimp()

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

// API.AI actions
const UNRECOGNIZED_DEEP_LINK = 'deeplink.unknown';
const CREATE_CAMPAIGN = 'create.campaign';

// API.AI parameter names
const CATEGORY_ARGUMENT = 'category';

app.post('/', function (request, response) {
  const assistant = new Assistant({request: request, response: response});
  console.log('Request headers: ' + JSON.stringify(request.headers));
  console.log('Request body: ' + JSON.stringify(request.body));

  // Greet the user and direct them to next turn
  function unhandledDeepLinks (assistant) {
    if (assistant.hasSurfaceCapability(assistant.SurfaceCapabilities.SCREEN_OUTPUT)) {
      assistant.ask(assistant.buildRichResponse()
        .addSimpleResponse('Welcome to the Mailchimp Assistant! I\'d really rather \
          not talk about ${assistant.getRawInput()}. Wouldn\'t you rather talk about \
          email? I can tell you about your campaigns. \
          Which do you want to hear about?')
        .addSuggestions(['Campaigns']));
    } else {
      assistant.ask('Welcome to the Mailchimp Assistant! I\'d really rather \
        not talk about ${assistant.getRawInput()}. Wouldn\'t you rather talk about \
        email? I can tell you about your campaigns. \
        Which do you want to hear about?',
        ['I do not understand.']);
    }
  }

  function handleCampaignSend(campaign_id) {
      console.log("sent campaign")
      assistant.ask('Congrats! We sent the campaign');
      return;
  }

  function handleError(error) {
      console.log(error)
      assistant.ask('Sorry, something went wrong');
      return;
  }

  function handleCampaignEdit(campaign_id) {
      console.log("edited campaign with id of " + campaign_id)
      mailchimp.sendCampaign(campaign_id, handleError, handleCampaignSend)
      return;
  }

  function handleCampaignCreation(campaign_id) {
      console.log("created campaign with id of " + campaign_id)
      mailchimp.editCampaign(campaign_id, handleError, handleCampaignEdit)
      return;
  }

  function createAndSendCampaign (assistant) {
      mailchimp.createCampaign(handleError, handleCampaignCreation);
  }

  let actionMap = new Map();
  actionMap.set(UNRECOGNIZED_DEEP_LINK, unhandledDeepLinks);
  actionMap.set(CREATE_CAMPAIGN, createAndSendCampaign);
  assistant.handleRequest(actionMap);
});

if (module === require.main) {
  let server = app.listen(process.env.PORT || 8080, function () {
    let port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;