'use strict';

process.env.DEBUG = 'actions-on-google:*';
let Assistant = require('actions-on-google').ApiAiAssistant;

let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.json({type: 'application/json'}));

const api_key = process.env.MAILCHIMP_API_KEY;
const Mailchimp = require('mailchimp-api-v3')
const mailchimp = new Mailchimp(api_key);

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

  function createCampaign(assistant, callback) {
      console.log('creating campaign..')
      mailchimp.post('campaigns', {
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
          callback(assistant, results.id, null)
      })
      .catch(function (err) {
          console.log('error');
          callback(assistant, null, err)
      })
  }

  function editCampaign(assistant, id, callback) {
      console.log('editing campaign..')
      mailchimp.put(`campaigns/${id}/content`, {
          'html': '<p>The HTML to use for the saved campaign<./p>'
      })
      .then(function(results) {
          console.log('campaign edited');
          console.log(results);
          callback(assistant, id, null)
      })
      .catch(function (err) {
          console.log('error');
          callback(assistant, null, err)
      })
  }

  function sendCampaign(assistant, id, callback) {
      console.log('sending campaign with id: ' + id)
      mailchimp.post(`campaigns/${id}/actions/send`)
      .then(function(results) {
          console.log('campaign sent');
          console.log(results);
          callback(assistant, results, null)
      })
      .catch(function (err) {
          console.log('error');
          callback(assistant, null, err)
      })
  }

  function handleCampaignSend(assistant, id, error) {
      if (error === null) {
        console.log("sent campaign")
        assistant.ask('Congrats! We sent the campaign',
          NULL_INPUTS);
        return;
      } else {
        console.log(error)
        return;
      }
  }

  function handleCampaignEdit(assistant, id, error) {
      if (error === null) {
        console.log("edited campaign with id of " + id)
        sendCampaign(assistant, id, handleCampaignSend)
        return;
      } else {
        console.log(error)
        return;
      }
  }

  function handleCampaignCreation(assistant, id, error) {
      if (error === null) {
        console.log("created campaign with id of " + id)
        editCampaign(assistant, id, handleCampaignEdit)
        return;
      } else {
        console.log(error)
        return;
      }
  }

  function createAndSendCampaign (assistant) {
      createCampaign(assistant, handleCampaignCreation);
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