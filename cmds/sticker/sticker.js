import db from "#db"
import fs from 'fs'
import fetch from 'node-fetch'
import sharp from 'sharp' // ✅ Usamos sharp directamente

export default {
  command: ['sticker', 's'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      console.log("========================================");
      console.log("🔍 [DEBUG] Comando 'sticker' ejecutado.");
      
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

      // ✅ FUNCIÓN PARA CREAR EL STICKER CON SHARP
      const crearSticker = async (buffer) => {
        return await sharp(buffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ quality: 80 })
          .toBuffer();
      };

      if (/image/.test(mime) || /webp/.test(mime)) {
        console.log("🖼️ [DEBUG] Procesando imagen o sticker...");
        let buffer = await quoted.download()
        console.log(`📦 [DEBUG] Buffer descargado (${buffer.length} bytes)`);
        
        // Convertimos directo a WebP
        const stickerBuffer = await crearSticker(buffer);
        
        await sock.sendMessage(msg.chat, { 
          sticker: stickerBuffer,
          packname: pack,
          author: author
        }, { quoted: msg })
        
        console.log("✅ [DEBUG] Sticker enviado correctamente.");
        
      } else if (/video/.test(mime)) {
        console.log("🎥 [DEBUG] Procesando video...");
        
        if ((quoted.msg || quoted).seconds > 20) {
          console.log("⚠️ [DEBUG] El video es demasiado largo.");
          return msg.reply('❖ El video no puede ser muy largo')
        }
        
        // Para videos, usamos ffmpeg directamente o pedimos que lo conviertan
        return msg.reply('❖ Por ahora no puedo procesar videos, envía una imagen.');
        
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
        
        const stickerBuffer = await crearSticker(buffer);
        
        await sock.sendMessage(msg.chat, { 
          sticker: stickerBuffer,
          packname: pack,
          author: author
        }, { quoted: msg })
        
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
