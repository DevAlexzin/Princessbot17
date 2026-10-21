
import { addExif } from '../lib/sticker.js'

export default {
  command: ['robars'],
  category: 'sticker',
  botAdmin: false,

  run: async ({ msg, sock }) => {
    try {
      const quoted = msg.quoted

      if (!quoted) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'Responde a un sticker para robarlo 👀' },
          { quoted: msg }
        )
      }

      const mime = quoted.mimetype || quoted.msg?.mimetype || ''

      if (!/webp/i.test(mime)) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'Responde a un sticker válido 👀' },
          { quoted: msg }
        )
      }

      let img

      if (typeof quoted.download === 'function') {
        img = await quoted.download()
      } else if (typeof sock.downloadMediaMessage === 'function') {
        img = await sock.downloadMediaMessage(quoted)
      }

      if (!img) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'No pude descargar el sticker 😢' },
          { quoted: msg }
        )
      }

      const rawName = msg.pushName || msg.senderName || 'Usuario'
      const packname = rawName
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .trim() || 'Usuario'

      const author = 'Oculto por privacidad'
      const sticker = await addExif(img, packname, author)

      if (!sticker) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'No pude procesar el sticker 😢' },
          { quoted: msg }
        )
      }

      await sock.sendMessage(
        msg.chat,
        { sticker },
        { quoted: msg }
      )

    } catch (e) {
      console.error('❌ [ERROR] Comando robars:', e)

      await sock.sendMessage(
        msg.chat,
        { text: '❌ Ocurrió un error al procesar el sticker.' },
        { quoted: msg }
      )
    }
  },
}
