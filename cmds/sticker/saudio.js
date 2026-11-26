import db from "#db"
import fs from 'fs'
import os from 'os'
import path from 'path'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import webpmux from 'node-webpmux' // ✅ Importación corregida para CommonJS
import crypto from 'crypto'

const { Image } = webpmux; // ✅ Desestructuración de Image

export default {
  command: ['saudio', 'stickeraudio'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      console.log("\n========================================");
      console.log("🔍 [DEBUG] Comando 'saudio' ejecutado.");
      
      const quoted = msg.quoted ? msg.quoted : msg
      const mime = (quoted.msg || quoted).mimetype || ''
      
      console.log("📄 [DEBUG] MIME detectado:", mime || "Desconocido");

      if (!/video/.test(mime)) {
        console.log("⚠️ [DEBUG] El mensaje citado no es un video.");
        return msg.reply("❌ Debes responder a un video para crear un sticker con audio.");
      }

      let user = await db.getUser(msg.sender)
      const name = user.name || 'Usuario'
      let texto1 = user.metadatos || `S'Princess Bot`
      let texto2 = user.metadatos2 || `@${name}`

      let marca = args.join(' ').trim().split(/[\u2022|]/).map(part => part.trim())
      let pack = marca[0] || texto1
      let author = marca.length > 1 ? marca[1] : texto2

      console.log(`🏷️ [DEBUG] Packname: "${pack}" | Author: "${author}"`);

      const crearStickerConAudio = async (buffer) => {
        return new Promise((resolve, reject) => {
          console.log(`🎥 [DEBUG] Iniciando conversión de video con audio (${buffer.length} bytes)...`);
          
          const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.mp4`);
          const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.webp`);
          
          try {
            fs.writeFileSync(tempInput, buffer);
            console.log(`💾 [DEBUG] Archivo temporal guardado en: ${tempInput}`);
          } catch (err) {
            console.error("❌ [DEBUG] Error al guardar archivo temporal de entrada:", err);
            return reject(err);
          }

          ffmpeg(tempInput)
            .addOutputOptions([
              "-vcodec", "libwebp",
              "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
              "-loop", "0",
              "-ss", "00:00:00.0",
              "-t", "00:00:05.0",
              "-preset", "default",
              "-vsync", "0",
              "-c:a", "libopus", 
              "-b:a", "64k",
              "-ac", "1",
              "-ar", "48000"
            ])
            .toFormat('webp')
            .save(tempOutput)
            .on('start', (commandLine) => {
              console.log('⚙️ [DEBUG] FFmpeg inició con el comando: ' + commandLine);
            })
            .on('progress', (progress) => {
              console.log(`⏳ [DEBUG] Procesando video... ${progress.percent ? progress.percent.toFixed(2) + '%' : '...'}`);
            })
            .on('end', async () => {
              console.log("✅ [DEBUG] FFmpeg terminó la conversión.");
              try {
                const stickerBuffer = fs.readFileSync(tempOutput);
                console.log(`📦 [DEBUG] Sticker WebP generado (${stickerBuffer.length} bytes).`);
                
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                console.log("🧹 [DEBUG] Archivos temporales eliminados.");
                
                console.log("🔧 [DEBUG] Iniciando incrustación de metadatos con node-webpmux...");
                
                const img = new Image();
                await img.load(stickerBuffer);
                
                const json = {
                  "sticker-pack-id": crypto.randomBytes(32).toString('hex'),
                  "sticker-pack-name": pack,
                  "sticker-pack-publisher": author,
                  "emojis": ["🎵"],
                  "is-avatar-sticker": 0
                };
                
                const exifAttr = Buffer.from([
                  0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
                ]);
                const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
                const exif = Buffer.concat([exifAttr, jsonBuffer]);
                exif.writeUIntLE(jsonBuffer.length, 14, 4);
                
                img.exif = exif;
                const finalBuffer = await img.save(null);
                
                console.log(`✅ [DEBUG] Metadatos incrustados. Sticker final (${finalBuffer.length} bytes).`);
                
                resolve(finalBuffer);
              } catch (err) {
                console.error("❌ [DEBUG] Error en el post-procesamiento (webpmux):", err);
                reject(err);
              }
            })
            .on('error', (err) => {
              console.error("❌ [DEBUG] Error en FFmpeg:", err.message);
              try {
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
              } catch (e) {
                console.error("❌ [DEBUG] Error limpiando temporales tras fallo:", e);
              }
              reject(err);
            });
        });
      };

      console.log("⬇️ [DEBUG] Descargando video...");
      let buffer = await quoted.download();
      console.log(`📦 [DEBUG] Video descargado (${buffer.length} bytes)`);
      
      const stickerBuffer = await crearStickerConAudio(buffer);
      
      await sock.sendMessage(msg.chat, { 
        sticker: stickerBuffer
      }, { quoted: msg })
      
      console.log("✅ [DEBUG] Sticker con audio enviado correctamente.");
      
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO EN EL COMANDO]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker con audio.")
    }
  }
}
