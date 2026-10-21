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
      // 🔍 Verificar que el mensaje sea una respuesta
      const quoted = msg.quoted

      if (!quoted) {
        return await sock.sendMessage(
          msg.chat,
          { text: '❖ Responde a un sticker para robarlo 👀' },
          { quoted: msg }
        )
      }

      // 🔍 Verificar que sea un sticker WebP
      const mime = (quoted.msg || quoted).mimetype || ''

      if (!/webp/i.test(mime)) {
        return await sock.sendMessage(
          msg.chat,
          { text: '❖ Responde a un sticker válido 👀' },
          { quoted: msg }
        )
      }

      // 📥 Descargar el sticker citado
      let buffer = await quoted.download()

      if (!buffer) {
        return await sock.sendMessage(
          msg.chat,
          { text: '❖ No pude descargar el sticker 😢' },
          { quoted: msg }
        )
      }

      // 📝 Obtener y limpiar el nombre del usuario
      const rawName = msg.pushName || 'Usuario'
      const packname = rawName
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .trim() || 'Usuario'

      // 🔹 Autor
      const author = 'Oculto por privacidad'

      // 🛠️ Añadir metadatos al sticker usando writeExif (igual que tu comando sticker.js)
      const media = { mimetype: mime, data: buffer }
      const metadata = { packname: packname, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      // 📤 Enviar el sticker
      await sock.sendMessage(
        msg.chat,
        {
          sticker: { url: stickerPath }
        },
        { quoted: msg }
      )

      // 🧹 Limpiamos el archivo temporal
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
