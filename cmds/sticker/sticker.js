import db from "#db"
import fs from 'fs'
import os from 'os'
import path from 'path'
import fetch from 'node-fetch'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

// Configuramos la ruta de ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath.path)

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

      // ✅ FUNCIÓN PARA CREAR EL STICKER CON SHARP (Imágenes)
      const crearStickerImagen = async (buffer) => {
        return await sharp(buffer)
          .resize(512, 512, {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .webp({ quality: 80 })
          .toBuffer();
      };

      // ✅ FUNCIÓN PARA CREAR EL STICKER CON FFMPEG (Videos)
      const crearStickerVideo = async (buffer) => {
        return new Promise((resolve, reject) => {
          // Creamos archivos temporales para procesar el video
          const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.mp4`);
          const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.webp`);
          
          fs.writeFileSync(tempInput, buffer);

          ffmpeg(tempInput)
            .addOutputOptions([
              "-vcodec", "libwebp",
              "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
              "-loop", "0",
              "-ss", "00:00:00.0",
              "-t", "00:00:05.0",
              "-preset", "default",
              "-an",
              "-vsync", "0"
            ])
            .toFormat('webp')
            .save(tempOutput)
            .on('end', () => {
              const stickerBuffer = fs.readFileSync(tempOutput);
              // Limpiamos los archivos temporales
              try {
                fs.unlinkSync(tempInput);
                fs.unlinkSync(tempOutput);
              } catch (err) {
                console.error("Error limpiando temporales:", err);
              }
              resolve(stickerBuffer);
            })
            .on('error', (err) => {
              try {
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
              } catch (e) {}
              reject(err);
            });
        });
      };

      if (/image/.test(mime) || /webp/.test(mime)) {
        console.log("🖼️ [DEBUG] Procesando imagen o sticker...");
        let buffer = await quoted.download()
        console.log(`📦 [DEBUG] Buffer descargado (${buffer.length} bytes)`);
        
        const stickerBuffer = await crearStickerImagen(buffer);
        
        await sock.sendMessage(msg.chat, { 
          sticker: stickerBuffer,
          packname: pack,
          author: author
        }, { quoted: msg })
        
        console.log("✅ [DEBUG] Sticker enviado correctamente.");
        
      } else if (/video/.test(mime)) {
        console.log("🎥 [DEBUG] Procesando video...");
        
        if ((quoted.msg || quoted).seconds > 10) {
          console.log("⚠️ [DEBUG] El video es demasiado largo.");
          return msg.reply('❖ El video no puede durar más de 10 segundos.');
        }

        console.log("⬇️ [DEBUG] Descargando video...");
        let buffer = await quoted.download();
        console.log(`📦 [DEBUG] Video descargado (${buffer.length} bytes)`);
        
        console.log("⏳ [DEBUG] Convirtiendo video a sticker...");
        const stickerBuffer = await crearStickerVideo(buffer);
        
        await sock.sendMessage(msg.chat, { 
          sticker: stickerBuffer,
          packname: pack,
          author: author
        }, { quoted: msg })
        
        console.log("✅ [DEBUG] Sticker de video enviado correctamente.");
        
      } else if (args[0] && isUrl(args[0])) {
        console.log("🔗 [DEBUG] Procesando URL...");
        const url = args[0]
        const res = await fetch(url)
        
        if (!res.ok) {
          console.log(`❌ [DEBUG] Error al descargar URL: ${res.statusText}`);
          return msg.reply('❖ No pude descargar ese archivo desde la URL.')
        }
        
        const buffer = Buffer.from(await res.arrayBuffer())
        const mimeUrl = res.headers.get('content-type') || '';
        console.log(`📦 [DEBUG] Buffer desde URL (${buffer.length} bytes) | MIME: ${mimeUrl}`);
        
        if (/video/.test(mimeUrl)) {
          const stickerBuffer = await crearStickerVideo(buffer);
          await sock.sendMessage(msg.chat, { 
            sticker: stickerBuffer,
            packname: pack,
            author: author
          }, { quoted: msg })
        } else {
          const stickerBuffer = await crearStickerImagen(buffer);
          await sock.sendMessage(msg.chat, { 
            sticker: stickerBuffer,
            packname: pack,
            author: author
          }, { quoted: msg })
        }
        
        console.log("✅ [DEBUG] Sticker desde URL enviado.");
        
      } else {
        console.log("⚠️ [DEBUG] No se detectó imagen, video ni URL.");
        return msg.reply(`❀ Por favor, envía una imagen, video o URL para hacer un sticker.`)
      }
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker.")
    }
  }
}

const isUrl = (text) => {
  return /^https?:\/\/.+/i.test(text)
}
