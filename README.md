# RingCentral Chatbot skill: Google Drive

This skill enables the chatbot to receive notifications when there are things changed in your Google Drive account.

It should be used together with [RingCentral Chatbot framework for JavaScript](https://github.com/ringcentral/ringcentral-chatbot-js).


## Install

```
yarn add ringcentral-chatbot-skill-google-drive
```


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
