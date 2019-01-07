import Google from './google'
import Service from './service'

const handle = async event => {
  switch (event.type) {
    case 'Message4Bot':
      await handleMessage4Bot(event)
      break
    default:
      break
  }
}

const handleMessage4Bot = async event => {
  const { text, group, bot } = event
  const reply = async text => bot.sendMessage(group.id, { text: text.trim() })
  switch (text.toLowerCase()) {
    case 'help':
      await reply(`
**help**: display this help message
**bind**: bind a Google drive account
**unbind**: unbind the bound Google drive account
      `)
      break
    case 'bind':
      const googleAuthUrl = Google.authUrl(`${group.id}:${bot.id}`)
      await reply(`Please [authorize me](${googleAuthUrl}) to access your Google Drive`)
      break
    case 'unbind':
      const service = await Service.findOne({ where: { name: 'GoogleDrive', botId: bot.id, groupId: group.id } })
      if (service !== null) {
        await service.removeWebHook()
        await service.destroy()
      }
      await reply('Done')
      break
    default:
      break
  }
}

export default handle
