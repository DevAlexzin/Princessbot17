import db from "#db"
import fs from 'fs'
import exif from '../../lib/exif.js'
const { writeExif } = exif

export default {
  command: ['robars'],
  category: 'stickers',
  botAdmin: false,

  run: async ({ msg, sock, args }) => {
    try {
      const quoted = msg.quoted

      if (!quoted) {
        return await sock.sendMessage(
          msg.chat,
          { text: '❖ Responde a un sticker para robarlo 👀' },
          { quoted: msg }
        )
      }

      const mime = (quoted.msg || quoted).mimetype || ''

      if (!/webp/i.test(mime)) {
        return await sock.sendMessage(
          msg.chat,
          { text: '❖ Responde a un sticker válido 👀' },
          { quoted: msg }
        )
      }

      let buffer = await quoted.download()

      if (!buffer) {
        return await sock.sendMessage(
          msg.chat,
          { text: '❖ No pude descargar el sticker 😢' },
          { quoted: msg }
        )
      }

      const rawName = msg.pushName || 'Usuario'
      const packname = rawName
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .trim() || 'Usuario'

      const author = 'Oculto por privacidad'

      const media = { mimetype: mime, data: buffer }
      const metadata = { packname: packname, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      await sock.sendMessage(
        msg.chat,
        {
          sticker: { url: stickerPath }
        },
        { quoted: msg }
      )

      fs.unlinkSync(stickerPath)

    } catch (e) {
      console.error('❌ [ERROR] Comando robar:', e)

      await sock.sendMessage(
        msg.chat,
        { text: '❌ Ocurrió un error al procesar el sticker.' },
        { quoted: msg }
      )
    }
  },
}
