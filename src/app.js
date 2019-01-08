import express from 'express'
import { Bot } from 'ringcentral-chatbot/dist/models'

import Google from './google'
import Service from './service'

const app = express()

app.get('/google/oauth', async (req, res) => {
  const { code, state } = req.query
  const [groupId, botId] = state.split(':')
  const googleClient = Google.create()
  const { tokens } = await googleClient.getToken(code)
  const query = { name: 'GoogleDrive', groupId, botId }
  const data = { tokens }
  let service = await Service.findOne({ where: query })
  if (service) {
    await service.removeWebHook()
    service = await service.update({ data })
    await service.createWebHook()
  } else {
    service = await Service.create({ ...query, data })
    await service.createWebHook()
  }
  const bot = await Bot.findByPk(botId)
  await bot.sendMessage(groupId, { text: 'I have been authorized to access your Google Drive' })
  res.send('<!doctype><html><body><script>close()</script></body></html>')
})

app.post('/google/webhook', async (req, res) => {
  console.log('/google/webhook req.headers:', new Date(), req.headers)
  const resourceId = req.header('x-goog-resource-id')
  const service = await Service.findOne({ where: { name: 'GoogleDrive', data: { subscription: { resourceId } } } })
  const drive = Google.drive(service.data.tokens)
  const r = await drive.changes.list({ pageToken: service.data.pageToken })
  console.log('await drive.changes.list:', JSON.stringify(r.data, null, 2))
  if (r.data.newStartPageToken) {
    service.data.pageToken = r.data.newStartPageToken
    await service.update({ data: service.data })
  }
  const change = r.data.changes.filter(change => change.type === 'file')[0]
  if (change) {
    const bot = await Bot.findByPk(service.botId)
    const r = await drive.files.get({ fileId: change.fileId, fields: 'id,name,trashed,createdTime,modifiedTime,trashedTime,webViewLink,lastModifyingUser/emailAddress,lastModifyingUser/displayName,trashingUser/emailAddress,trashingUser/displayName' })
    console.log('drive.files.get:', r.data)
    if (r.data.lastModifyingUser) {
      let action
      if (r.data.trashed) {
        action = 'trashed'
      } else if (r.data.createdTime === r.data.modifiedTime) {
        action = 'added'
      }
      if (action) {
        const user = r.data.lastModifyingUser.displayName || r.data.lastModifyingUser.emailAddress
        await bot.sendMessage(service.groupId, { text: `${user} ${action} file [${r.data.name}](${r.data.webViewLink})` })
      }
    }
  }
  res.send('')
})

app.put('/google/refresh-subscriptions', async (req, res) => {
  const services = await Service.findAll({ where: { name: 'GoogleDrive' } })
  for (const service of services) {
    try {
      await service.removeWebHook()
      await service.createWebHook()
    } catch (e) {
      // User revoked access to his/her Google Drive
      if (e.response && (e.response.status === 400 || e.response.status === 401)) {
        await service.destroy()
      }
    }
  }
  res.send('')
})

export default app
