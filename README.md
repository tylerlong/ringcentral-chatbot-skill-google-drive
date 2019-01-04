# RingCentral Chatbot skill: Google Drive

This skill enables the chatbot to receive notifications when there are things changed in your Google Drive account.

It should be used together with [RingCentral Chatbot framework for JavaScript](https://github.com/ringcentral/ringcentral-chatbot-js).


## Install

```
yarn add ringcentral-chatbot-skill-google-drive
```


## Environment variables

In order for this skill to work, you need to provide the following information as environment variables:

- GOOGLE_API_CLIENT_ID
- GOOGLE_API_CLIENT_SECRET
- GOOGLE_SITE_VERIFICATION

`GOOGLE_SITE_VERIFICATION` is for google to verify that you own the domain name, it is optional.


## Basic Sample

```js
import createApp from 'ringcentral-chatbot/dist/apps'
import googleDriveSkill from 'ringcentral-chatbot-skill-google-drive'

const app = createApp(undefined, [googleDriveSkill])
```


## Advanced Sample

```js
import createApp from 'ringcentral-chatbot/dist/apps'
import googleDriveSkill from 'ringcentral-chatbot-skill-google-drive'
// import fooSkill from 'ringcentral-chatbot-skill-foo'
// import barSkill from 'ringcentral-chatbot-skill-bar'

const handle = async event => {
  // event handling code
}

const app = createApp(handle, [
  googleDriveSkill,
//   fooSkill,
//   barSkill
])
app.listen(3000)
```


## Cron job to refresh Google subscriptions

We use subscriptions to minitor changes to Google Drive.
Subscriptions expire. We need to setup cron jobs to refresh them to keep them alive.

The way to refresh subscriptions is simple and direct:

```
HTTP PUT https://<chatbot-server>/google/refresh-subscriptions
```

It is recommended to do refreshing every hour.

You can create linux cron tab:

```
0 * * * * curl -X PUT https://<chatbot-server>/google/refresh-subscriptions
```

Or you can write some JS code if you run your bot as a express.js server:

```js
import axios from 'axios'

setInterval(() => axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/google/refresh-subscriptions`), 3600000)
```

Or if your bot is deployed to AWS Lambda:


In your `dist/lambda.js` file:

```js
import axios from 'axios'

module.exports.crontab = async () => {
  await axios.put(`${process.env.RINGCENTRAL_CHATBOT_SERVER}/google/refresh-subscription`)
}
```

In your `serverless.yml` file:

```yml
functions:
  crontab:
    handler: dist/lambda.crontab
    events:
      - schedule: rate(1 hour)
```


## Todo

- What if user revoked access to Google drive?
