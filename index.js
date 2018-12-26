import express from 'express'

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
    await bot.sendMessage(group.id, { text: 'OK, let\'s do it' })
  }
}

const app = express()
app.get('/google/oauth', async (req, res) => {

})
skill.app = app

export default skill
