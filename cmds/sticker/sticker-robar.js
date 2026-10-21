import { addExif } from '../../lib/sticker.js'

export default {
  command: ['robars'],
  category: 'sticker',
  botAdmin: false,

  run: async ({ msg, sock }) => {
    try {
      // 🔍 Verificar que el mensaje sea una respuesta
      const quoted = msg.quoted

      if (!quoted) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'Responde a un sticker para robarlo 👀' },
          { quoted: msg }
        )
      }

      // 🔍 Verificar que sea un sticker WebP
      const mime = quoted.mimetype || quoted.msg?.mimetype || ''

      if (!/webp/i.test(mime)) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'Responde a un sticker válido 👀' },
          { quoted: msg }
        )
      }

      // 📥 Descargar el sticker citado
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

      // 📝 Obtener y limpiar el nombre del usuario
      const rawName =
        msg.pushName ||
        msg.senderName ||
        'Usuario'

      const packname = rawName
        .replace(/[^\p{L}\p{N}\s]/gu, '')
        .trim() || 'Usuario'

      // 🔹 Autor vacío
      const author = 'Oculto por privacidad'

      // 🛠️ Añadir metadatos al sticker
      const sticker = await addExif(img, packname, author)

      if (!sticker) {
        return await sock.sendMessage(
          msg.chat,
          { text: 'No pude procesar el sticker 😢' },
          { quoted: msg }
        )
      }

      // 📤 Enviar el sticker
      await sock.sendMessage(
        msg.chat,
        {
          sticker: sticker
        },
        { quoted: msg }
      )

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
