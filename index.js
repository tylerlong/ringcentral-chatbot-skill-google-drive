import express from 'express'
import { google } from 'googleapis'
// import uuid from 'uuid/v1'

const createGoogleClient = () => new google.auth.OAuth2(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.RINGCENTRAL_CHATBOT_SERVER + '/google/oauth'
)

const skill = {}

skill.handle = async event => {
  switch (event.type) {
    case 'Message4Bot':
      handleMessage4Bot(event)
      break
    default:
      break
  }
}
const handleMessage4Bot = async event => {
  const { text, group, bot } = event
  if (text === 'watch') {
    const googleClient = createGoogleClient()
    const googleUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      state: group.id
    })
    await bot.sendMessage(group.id, { text: googleUrl })
  }
}

const app = express()
app.get('/google/oauth', async (req, res) => {
  const { code, state } = req.query
  console.log(state)
  const googleClient = createGoogleClient()
  const { tokens } = await googleClient.getToken(code)
  googleClient.setCredentials(tokens)
  console.log(tokens)
  // const drive = google.drive({ version: 'v3', googleClient })
  // const notification = await drive.changes.watch({
  //   requestBody: {
  //     id: uuid(),
  //     type: 'web_hook',
  //     address: process.env.RINGCENTRAL_CHATBOT_SERVER + '/google/webhook'
  //   }
  // })
  // console.log(notification)
  res.send('')
})
app.post('/google/webhook', async (req, res) => {
  res.send('')
})
skill.app = app

export default skill
