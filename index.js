import express from 'express'
import { google } from 'googleapis'

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
  if (text === 'google authorize') {
    const googleClient = createGoogleClient()
    const googleUrl = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive']
    })
    await bot.sendMessage(group.id, { text: googleUrl })
  }
}

const app = express()
app.get('/google/oauth', async (req, res) => {
  const { code } = req.query
  const googleClient = createGoogleClient()
  const { tokens } = await googleClient.getToken(code)
  googleClient.setCredentials(tokens)
  console.log(tokens)
})
skill.app = app

export default skill
