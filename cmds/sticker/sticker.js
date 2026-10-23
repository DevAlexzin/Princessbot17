import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
import exif from '../lib/exif.js' // ✅ Asegúrate de que esta ruta sea correcta
const { writeExif } = exif

export default {
  command: ['sticker', 's'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      console.log("========================================");
      console.log("🔍 [DEBUG] Comando 'sticker' ejecutado.");
      console.log("📩 [DEBUG] args:", args);
      
      const quoted = msg.quoted ? msg.quoted : msg
      const mime = (quoted.msg || quoted).mimetype || ''
      
      console.log("📄 [DEBUG] MIME detectado:", mime);

      let user = await db.getUser(msg.sender)
      const name = user.name || 'Usuario'
      let texto1 = user.metadatos || `S'Princess Bot`
      let texto2 = user.metadatos2 || `@${name}`

      let marca = args.join(' ').trim().split(/[\u2022|]/).map(part => part.trim())
      let pack = marca[0] || texto1
      let author = marca.length > 1 ? marca[1] : texto2

      console.log(`🏷️ [DEBUG] Packname: "${pack}" | Author: "${author}"`);

      if (/image/.test(mime) || /webp/.test(mime)) {
        console.log("🖼️ [DEBUG] Procesando imagen o sticker...");
        let buffer = await quoted.download()
        console.log(`📦 [DEBUG] Buffer descargado (${buffer.length} bytes)`);
        
        const media = { mimetype: mime, data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)
        
        console.log(`✅ [DEBUG] Sticker creado en: ${stickerPath}`);
        
        await sock.sendMessage(msg.chat, { sticker: { url: stickerPath }}, { quoted: msg })
        fs.unlinkSync(stickerPath)
        console.log("✅ [DEBUG] Sticker enviado y archivo temporal eliminado.");
        
      } else if (/video/.test(mime)) {
        console.log("🎥 [DEBUG] Procesando video...");
        
        if ((quoted.msg || quoted).seconds > 20) {
          console.log("⚠️ [DEBUG] El video es demasiado largo.");
          return msg.reply('❖ El video no puede ser muy largo')
        }
        
        let buffer = await quoted.download()
        console.log(`📦 [DEBUG] Video descargado (${buffer.length} bytes)`);
        
        const tmpFile = `./lib/system/tmp/video-${Date.now()}.mp4`
        fs.writeFileSync(tmpFile, buffer)
        
        await sock.sendVideoAsSticker(msg.chat, tmpFile, msg, { packname: pack, author: author })
        fs.unlinkSync(tmpFile)
        console.log("✅ [DEBUG] Video enviado como sticker.");
        
      } else if (args[0] && isUrl(args[0])) {
        console.log("🔗 [DEBUG] Procesando URL...");
        const url = args[0]
        const res = await fetch(url)
        
        if (!res.ok) {
          console.log(`❌ [DEBUG] Error al descargar URL: ${res.statusText}`);
          return msg.reply('❖ No pude descargar ese archivo desde la URL.')
        }
        
        const buffer = Buffer.from(await res.arrayBuffer())
        console.log(`📦 [DEBUG] Buffer desde URL (${buffer.length} bytes)`);
        
        const media = { mimetype: 'image/webp', data: buffer }
        const metadata = { packname: pack, author: author, categories: [''] }
        const stickerPath = await writeExif(media, metadata)
        
        await sock.sendMessage(msg.chat, { sticker: { url: stickerPath }}, { quoted: msg })
        fs.unlinkSync(stickerPath)
        console.log("✅ [DEBUG] Sticker desde URL enviado.");
        
      } else {
        console.log("⚠️ [DEBUG] No se detectó imagen, video ni URL.");
        return sock.reply(msg.chat, `❀ Por favor, envía una imagen, video o URL para hacer un sticker.`, msg)
      }
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO]:", e);
      return msg.reply(msgglobal)
    }
  }
}

const isUrl = (text) => {
  return /^https?:\/\/.+/i.test(text)
}
