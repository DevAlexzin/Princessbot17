import db from "#db"
import fs from 'fs'
import os from 'os'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'

export default {
  command: ['saudio', 'stickeraudio'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      console.log("\n========================================");
      console.log("🔍 [DEBUG] Comando 'saudio' ejecutado.");

      const quoted = msg.quoted ? msg.quoted : msg;
      const mime = (quoted.msg || quoted).mimetype || '';
      const isVideo = /video/.test(mime);

      // 1. Obtener información del usuario para los metadatos
      let user = await db.getUser(msg.sender);
      const name = user.name || 'Usuario';
      let texto1 = user.metadatos || `S'Princess Bot`;
      let texto2 = user.metadatos2 || `@${name}`;
      let marca = args.join(' ').trim().split(/[\u2022|]/).map(p => p.trim());
      let pack = marca[0] || texto1;
      let author = marca.length > 1 ? marca[1] : texto2;

      if (!isVideo) {
        return msg.reply('❖ Envía o responde a un *video* con `.saudio` para crear un sticker con su audio integrado.');
      }

      console.log("🎥 [DEBUG] Video detectado, generando sticker con audio...");
      
      const seconds = (quoted.msg || quoted).seconds;
      if (seconds && seconds > 10) {
        return msg.reply('❖ El video no puede durar más de 10 segundos.');
      }

      const buffer = await quoted.download();
      
      const tempIn = path.join(os.tmpdir(), `in_${Date.now()}.mp4`);
      const tempOut = path.join(os.tmpdir(), `out_${Date.now()}.webp`); 
      
      fs.writeFileSync(tempIn, buffer);

      // 2. Convertir video a WebP conservando el audio (libopus)
      await new Promise((resolve, reject) => {
        ffmpeg(tempIn)
          .addOutputOptions([
            "-vcodec", "libwebp",
            "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
            "-loop", "0",
            "-ss", "00:00:00.0",
            "-t", "00:00:05.0",
            "-preset", "default",
            "-vsync", "0",
            "-c:a", "libopus", // Códec de audio para WhatsApp
            "-b:a", "64k"
          ])
          .toFormat('webp')
          .save(tempOut)
          .on('end', resolve)
          .on('error', (err) => {
            console.error("❌ [DEBUG] Error en FFmpeg:", err);
            reject(err);
          });
      });

      const stickerBuffer = fs.readFileSync(tempOut);

      // 3. Enviar el sticker con audio
      // La nueva librería @dnuzi/baileys detecta automáticamente el audio en el WebP
      await sock.sendMessage(msg.chat, { 
        sticker: stickerBuffer,
        packname: pack,
        author: author
      }, { quoted: msg });

      // Limpieza de archivos temporales
      if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);

      console.log("✅ [DEBUG] Sticker con audio enviado.");
      
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO saudio]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker con audio.");
    }
  }
};
