import db from "#db"
import fs from 'fs'
import os from 'os'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import pkg from 'node-webpmux'; // <-- Importación corregida
const { Image } = pkg;

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

      const seconds = (quoted.msg || quoted).seconds;
      if (seconds && seconds > 10) {
        return msg.reply('❖ El video no puede durar más de 10 segundos.');
      }

      console.log("🎥 [DEBUG] Video detectado, generando sticker con audio...");
      const buffer = await quoted.download();
      
      const tempIn = path.join(os.tmpdir(), `in_${Date.now()}.mp4`);
      const tempOut = path.join(os.tmpdir(), `out_${Date.now()}.webp`); 
      
      fs.writeFileSync(tempIn, buffer);

      // 1. Convertir video a WebP conservando el audio
      await new Promise((resolve, reject) => {
        ffmpeg(tempIn)
          .addOutputOptions([
            "-vcodec", "libwebp",
            "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
            "-loop", "0",
            "-ss", "00:00:00.0",
            "-t", "00:00:05.0",
            "-preset", "default",
            // ⚠️ QUITAMOS EL "-an" PARA CONSERVAR EL AUDIO
            "-vsync", "0",
            "-c:a", "libopus",
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

      // 2. Inyectar metadatos (Packname y Author) usando node-webpmux
      const img = new Image();
      await img.load(stickerBuffer);
      
      const json = {
        "sticker-pack-id": "com.alisa.kujou.bot",
        "sticker-pack-name": pack,
        "sticker-pack-publisher": author,
        "emojis": ["✨"]
      };
      
      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      
      img.exif = exif;
      const finalBuffer = await img.save(null);

      // 3. Enviar el sticker con audio
      await sock.sendMessage(msg.chat, { 
        sticker: finalBuffer
      }, { quoted: msg });

      // Limpieza
      if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
      if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);

      console.log("✅ [DEBUG] Sticker con audio enviado.");
      
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO saudio]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker con audio.");
    }
  }
};
