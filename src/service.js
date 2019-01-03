import Service from 'ringcentral-chatbot/dist/models/Service'
import uuid from 'uuid/v1'

import Google from './google'

Service.prototype.createWebHook = async function () {
  const drive = Google.drive(this.tokens)
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
      address: process.env.RINGCENTRAL_CHATBOT_SERVER + '/google/webhook',
      expiration: 86400000 + new Date().getTime() // one day later
    }
  })
  console.log('await drive.changes.watch:', r.data)
  this.data.pageToken = pageToken
  this.data.subscription = r.data
  await this.update({ data: this.data })
}

Service.prototype.removeWebHook = async function () {
  if (this.data.subscription) {
    const channel = Google.channel(this.tokens)
    const r = await channel.stop({
      id: this.data.subscription.id,
      resourceId: this.data.subscription.resourceId
    })
    console.log('await channel.stop:', r.data)
    delete this.data.subscription
    delete this.data.pageToken
    await this.update({ data: this.data })
  }
}
