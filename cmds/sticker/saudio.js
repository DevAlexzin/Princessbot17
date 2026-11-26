import db from "#db"
import fs from 'fs'
import os from 'os'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'
import webpmux from 'node-webpmux'
import crypto from 'crypto'

const execFileAsync = promisify(execFile)
const { Image } = webpmux

export default {
  command: ['saudio', 'stickeraudio'],
  category: 'stickers',
  run: async ({ msg, sock, args, command, text, usedPrefix: prefix }) => {
    try {
      console.log("\n========================================")
      console.log("🔍 [DEBUG] Comando 'saudio' ejecutado.")

      const quoted = msg.quoted ? msg.quoted : msg
      const mime = (quoted.msg || quoted).mimetype || ''

      if (!/video/.test(mime)) {
        return msg.reply("❌ Debes responder a un video para crear un sticker con audio.")
      }

      let user = await db.getUser(msg.sender)
      const name = user.name || 'Usuario'
      let texto1 = user.metadatos || `S'Princess Bot`
      let texto2 = user.metadatos2 || `@${name}`

      let marca = args.join(' ').trim().split(/[\u2022|]/).map(part => part.trim())
      let pack = marca[0] || texto1
      let author = marca.length > 1 ? marca[1] : texto2

      console.log("⬇️ [DEBUG] Descargando video...")
      let buffer = await quoted.download()
      console.log(`📦 [DEBUG] Video descargado (${buffer.length} bytes)`)

      // 1. Guardamos el video en un archivo temporal
      const tempInput = path.join(os.tmpdir(), `input_${Date.now()}.mp4`)
      const tempOutput = path.join(os.tmpdir(), `output_${Date.now()}.webp`)
      fs.writeFileSync(tempInput, buffer)

      // 2. Convertimos con ffmpeg usando los flags exactos para audio
      // Nota: Usamos execFile directo para tener control total sobre los argumentos
      console.log("🎥 [DEBUG] Convirtiendo video a WebP con audio...")
      
      const ffmpegArgs = [
        '-y',
        '-i', tempInput,
        '-t', '00:00:05.0', // Máximo 5 segundos
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
        '-c:v', 'libwebp',
        '-lossless', '0',
        '-compression_level', '6',
        '-q:v', '50',
        '-preset', 'picture',
        '-an', // ⚠️ IMPORTANTE: Quitamos el audio del stream de video
        '-vsync', '0',
        tempOutput
      ]

      try {
        const { stderr } = await execFileAsync('ffmpeg', ffmpegArgs)
        console.log("✅ [DEBUG] FFmpeg terminó la conversión de video.")
        if (stderr) console.log("ℹ️ [DEBUG] FFmpeg stderr:", stderr)
      } catch (err) {
        console.error("❌ [DEBUG] Error en FFmpeg:", err.message)
        return msg.reply("❌ Error al convertir el video.")
      }

      // 3. Leemos el WebP generado
      let stickerBuffer = fs.readFileSync(tempOutput)
      console.log(`📦 [DEBUG] WebP generado (${stickerBuffer.length} bytes).`)

      // 4. Verificamos si el WebP tiene audio (buscando el chunk OPUS o VORB)
      const hasAudio = stickerBuffer.includes(Buffer.from('OPUS')) || stickerBuffer.includes(Buffer.from('VORB'))
      console.log(`🔊 [DEBUG] ¿El WebP contiene datos de audio? ${hasAudio ? 'SÍ' : 'NO'}`)

      // 5. Incrustamos los metadatos con node-webpmux
      console.log("🔧 [DEBUG] Incrustando metadatos...")
      const img = new Image()
      await img.load(stickerBuffer)

      const json = {
        "sticker-pack-id": crypto.randomBytes(32).toString('hex'),
        "sticker-pack-name": pack,
        "sticker-pack-publisher": author,
        "emojis": ["🎵"],
        "is-avatar-sticker": 0,
        "audio": hasAudio ? 1 : 0
      }

      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00
      ])
      const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8')
      const exif = Buffer.concat([exifAttr, jsonBuffer])
      exif.writeUIntLE(jsonBuffer.length, 14, 4)

      img.exif = exif
      const finalBuffer = await img.save(null)

      // Limpiamos temporales
      fs.unlinkSync(tempInput)
      fs.unlinkSync(tempOutput)

      await sock.sendMessage(msg.chat, { sticker: finalBuffer }, { quoted: msg })
      console.log("✅ [DEBUG] Sticker enviado.")

    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO]:", e)
      return msg.reply("❌ Ocurrió un error al crear el sticker.")
    }
  }
}
