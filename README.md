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


## Todo

- What if user revoked access to Google drive?
