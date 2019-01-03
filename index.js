import express from 'express'
import { google } from 'googleapis'
import { Service, Bot } from 'ringcentral-chatbot/dist/models'
import uuid from 'uuid/v1'
import moment from 'moment'

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
const sendAuthLink = async (group, bot) => {
  const googleClient = createGoogleClient()
  const googleUrl = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    state: `${group.id}:${bot.id}`,
    prompt: 'consent'
  })
  await bot.sendMessage(group.id, { text: `Please [authorize me](${googleUrl}) to access your Google Drive` })
}
const handleMessage4Bot = async event => {
  const { text, group, bot } = event
  if (text === 'list') {
    const query = { name: 'GoogleDrive', groupId: group.id, botId: bot.id }
    const service = await Service.findOne({ where: query })
    if (service) {
      const googleClient = createGoogleClient()
      googleClient.setCredentials(service.data.tokens)
      const drive = google.drive({ version: 'v3', auth: googleClient })
      let r
      try {
        r = await drive.files.list()
        const text = r.data.files.map(file => file.name).slice(0, 6).join('\n')
        await bot.sendMessage(group.id, { text })
      } catch (e) {
        if (e.response && e.response.status === 400) { // google token invalid
          console.log('google token invalid')
          service.destroy()
          await sendAuthLink(group, bot)
        }
      }
    } else {
      await sendAuthLink(group, bot)
    }
  }
}

const app = express()
app.get('/google/oauth', async (req, res) => {
  const { code, state } = req.query
  const [groupId, botId] = state.split(':')
  const googleClient = createGoogleClient()
  const { tokens } = await googleClient.getToken(code)
  const query = { name: 'GoogleDrive', groupId, botId }
  const data = { tokens }
  let service = await Service.findOne({ where: query })
  if (service) {
    service = await service.update({ data })
  } else {
    service = await Service.create({ ...query, data })
  }
  const bot = await Bot.findByPk(botId)
  await bot.sendMessage(groupId, { text: 'I have been authorized to access your Google Drive' })

  googleClient.setCredentials(tokens)
  const drive = google.drive({ version: 'v3', auth: googleClient })
  let r = await drive.changes.getStartPageToken()
  const pageToken = r.data.startPageToken
  r = await drive.changes.watch({
    pageToken,
    pageSize: 3,
    includeCorpusRemovals: true,
    includeTeamDriveItems: true,
    supportsTeamDrives: true,
    requestBody: {
      id: uuid(),
      type: 'web_hook',
      address: process.env.RINGCENTRAL_CHATBOT_SERVER + '/google/webhook'
    }
  })
  console.log('await drive.changes.watch:', r.data)
  data.subscription = r.data
  data.pageToken = pageToken
  service = await service.update({ data })

  res.send('<!doctype><html><body><script>close()</script></body></html>')
})
app.post('/google/webhook', async (req, res) => {
  console.log('/google/webhook req.headers:', req.headers)
  const resourceId = req.header('x-goog-resource-id')
  const service = await Service.findOne({ where: { data: { subscription: { resourceId } } } })
  const googleClient = createGoogleClient()
  googleClient.setCredentials(service.data.tokens)
  const drive = google.drive({ version: 'v3', auth: googleClient })
  const r = await drive.changes.list({ pageToken: service.data.pageToken })
  console.log('await drive.changes.list:', JSON.stringify(r.data, null, 2))
  if (r.data.newStartPageToken) {
    await service.update({ data: { ...service.data, pageToken: r.data.newStartPageToken } })
  }

  const bot = await Bot.findByPk(service.botId)

  for (const change of r.data.changes) {
    if (change.type === 'file') {
      const r = await drive.files.get({ fileId: change.fileId, fields: 'id,name,trashed,createdTime,modifiedTime,trashedTime,webViewLink,lastModifyingUser/emailAddress,lastModifyingUser/displayName,trashingUser/emailAddress,trashingUser/displayName' })
      console.log('drive.files.get:', r.data)
      if (!r.data.lastModifyingUser) {
        continue
      }
      let action = 'modified'
      if (r.data.trashed) {
        action = 'deleted'
      }
      if (r.data.createdTime === r.data.modifiedTime && moment() - moment(r.data.modifiedTime) < 60000) {
        action = 'added'
      }
      const user = r.data.lastModifyingUser.displayName || r.data.lastModifyingUser.emailAddress
      await bot.sendMessage(service.groupId, { text: `File "[${r.data.name}](${r.data.webViewLink})" ${action} by ${user}` })
    }
  }
  res.send('')
})
app.get('/', async (req, res) => {
  res.send('<!doctype><html><head><meta name="google-site-verification" content="ulGncwwPpE8ox4k34EOOUrQfKv5kJKIgXPNbiHuPyfw" /></head></html>')
})
skill.app = app

export default skill
