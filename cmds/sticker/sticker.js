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
      console.log("\n========================================");
      console.log("🔍 [DEBUG] Comando 'sticker' ejecutado.");
      
      const quoted = msg.quoted ? msg.quoted : msg
      const mime = (quoted.msg || quoted).mimetype || ''
      
      console.log("📄 [DEBUG] MIME detectado:", mime || "Desconocido");

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
        console.log(`🖼️ [DEBUG] Iniciando conversión de imagen (${buffer.length} bytes)...`);
        try {
          const result = await sharp(buffer)
            .resize(512, 512, {
              fit: 'contain',
              background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .webp({ quality: 80 })
            .toBuffer();
          console.log(`✅ [DEBUG] Imagen convertida a WebP (${result.length} bytes).`);
          return result;
        } catch (err) {
          console.error("❌ [DEBUG] Error en Sharp al convertir imagen:", err);
          throw err;
        }
      };

      // ✅ FUNCIÓN PARA CREAR EL STICKER CON FFMPEG (Videos)
      const crearStickerVideo = async (buffer) => {
        return new Promise((resolve, reject) => {
          console.log(`🎥 [DEBUG] Iniciando conversión de video (${buffer.length} bytes)...`);
          
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
              "-an",
              "-vsync", "0"
            ])
            .toFormat('webp')
            .save(tempOutput)
            .on('start', (commandLine) => {
              console.log('⚙️ [DEBUG] FFmpeg inició con el comando: ' + commandLine);
            })
            .on('progress', (progress) => {
              console.log(`⏳ [DEBUG] Procesando video... ${progress.percent ? progress.percent.toFixed(2) + '%' : '...'}`);
            })
            .on('end', () => {
              console.log("✅ [DEBUG] FFmpeg terminó la conversión de video.");
              try {
                const stickerBuffer = fs.readFileSync(tempOutput);
                console.log(`📦 [DEBUG] Sticker WebP generado (${stickerBuffer.length} bytes).`);
                
                // Limpiamos los archivos temporales
                if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
                if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
                console.log("🧹 [DEBUG] Archivos temporales eliminados.");
                
                resolve(stickerBuffer);
              } catch (err) {
                console.error("❌ [DEBUG] Error al leer el archivo de salida:", err);
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

      if (/image/.test(mime) || /webp/.test(mime)) {
        console.log("📥 [DEBUG] Descargando imagen...");
        let buffer = await quoted.download()
        console.log(`📦 [DEBUG] Buffer de imagen descargado (${buffer.length} bytes)`);
        
        const stickerBuffer = await crearStickerImagen(buffer);
        
        await sock.sendMessage(msg.chat, { 
          sticker: stickerBuffer,
          packname: pack,
          author: author
        }, { quoted: msg })
        
        console.log("✅ [DEBUG] Sticker de imagen enviado correctamente.");
        
      } else if (/video/.test(mime)) {
        console.log("🎥 [DEBUG] Procesando video...");
        
        // Validación de duración (a veces la propiedad seconds no existe)
        const seconds = (quoted.msg || quoted).seconds;
        console.log(`⏱️ [DEBUG] Duración del video: ${seconds || 'Desconocida'} segundos`);
        
        if (seconds && seconds > 10) {
          console.log("⚠️ [DEBUG] El video es demasiado largo. Cancelando.");
          return msg.reply('❖ El video no puede durar más de 10 segundos.');
        }

        console.log("⬇️ [DEBUG] Descargando video...");
        let buffer = await quoted.download();
        console.log(`📦 [DEBUG] Video descargado (${buffer.length} bytes)`);
        
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
        console.log(`📦 [DEBUG] Buffer desde URL descargado (${buffer.length} bytes) | MIME: ${mimeUrl}`);
        
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
        console.log("⚠️ [DEBUG] No se detectó imagen, video ni URL. MIME:", mime);
        return msg.reply(`❀ Por favor, envía una imagen, video o URL para hacer un sticker.`)
      }
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO EN EL COMANDO]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker.")
    }
  }
}

const isUrl = (text) => {
  return /^https?:\/\/.+/i.test(text)
}
