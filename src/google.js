import { google } from 'googleapis'

const create = () => new google.auth.OAuth2(
  process.env.GOOGLE_API_CLIENT_ID,
  process.env.GOOGLE_API_CLIENT_SECRET,
  process.env.RINGCENTRAL_CHATBOT_SERVER + '/google/oauth'
)

const drive = tokens => {
  const client = create()
  client.setCredentials(tokens)
  const drive = google.drive({ version: 'v3', auth: client })
  return drive
}

const channel = tokens => {
  const client = create()
  client.setCredentials(tokens)
  const channel = google.channel({ version: 'v3', auth: client })
  return channel
}

const authUrl = state => {
  const client = create()
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    state,
    prompt: 'consent'
  })
  return authUrl
}

export default { create, drive, channel, authUrl }
