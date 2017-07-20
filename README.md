# MailChimp App for the Google Assistant
This is a Node.js app for sending MailChimp email campaigns through Google Assistant.

## Usage
Instructions for running the app yourself with Heroku.

### Clone the repo
```bash
git clone git@github.com:ckirksey3/mailchimp-google-assistant.git
cd mailchimp-google-assistant
```

### Create a Heroku app
```bash
heroku create
git push heroku master
```

### Get your MailChimp API key
1. Log into [MailChimp](mailchimp.com)
1. Click your profile name to expand the Account Panel, and choose **Account**.
1. Click the Extras drop-down menu and choose **API keys**.
1. Copy an existing API key or click the **Create A Key** button.

### Set API key to Heroku environment variable
```bash
heroku config:set MAILCHIMP_API_KEY=13dd123f3ta8790ea02912e5c7y98-us23
```
(that's not my real key of course 😉)
