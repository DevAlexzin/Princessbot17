import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

const fetchStickerVideo = async (text) => {
  const response = await axios.get(
    'https://skyzxu-brat.hf.space/brat-animated',
    {
      params: { text },
      responseType: 'arraybuffer',
      timeout: 60000
    }
  )

  if (!response.data) {
    throw new Error('Error al obtener el video de la API.')
  }

  return Buffer.from(response.data)
}

const convertToWebp = async (input, output) => {
  await execAsync(
    `ffmpeg -y -i "${input}" -vf "scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15" -loop 0 -an -vsync 0 -c:v libwebp -quality 70 -compression_level 6 "${output}"`
  )
}

export default {
  command: ['bratv', 'bratvid'],
  category: 'sticker',
  botAdmin: false,

  run: async ({ msg, sock }) => {
    let mp4
    let webp

    try {
      // ✅ SOLUCIÓN: Quitamos el comando (.bratv) del texto para que no salga en el sticker
      let textoOriginal = msg.quoted?.text || msg.text || msg.body || '';
      const texto = textoOriginal
        .replace(/^[.\/!#]?(bratv|bratvid)\s*/i, '')
        .trim();

      if (!texto) {
        return await sock.sendMessage(
          msg.chat,
          {
            text: '📌 *Debes responder a un mensaje o escribir un texto para generar el sticker.*'
          },
          { quoted: msg }
        )
      }

      // ⏳ Reacción de procesamiento
      if (typeof msg.react === 'function') {
        await msg.react('🕒')
      }

      // 👤 Obtener información del usuario
      const sender = msg.sender || msg.key?.participant || ''
      const users = globalThis.db?.data?.users || {}
      const user = users[sender] || {}

      const name = user.name || sender.split('@')[0] || 'Usuario'
      const packname = user.metadatos || 'Sʜᴀᴅᴏᴡ Gᴀʀᴅᴇɴ ⚜'
      const author = user.metadatos2 || `@${name}`

      // 🌐 Generar video mediante la API
      const videoBuffer = await fetchStickerVideo(texto)

      // 📂 Crear archivos temporales únicos
      const tempDir = os.tmpdir()
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`

      mp4 = path.join(tempDir, `brat-${id}.mp4`)
      webp = path.join(tempDir, `brat-${id}.webp`)

      fs.writeFileSync(mp4, videoBuffer)

      // 🎞️ Convertir MP4 a WebP animado
      await convertToWebp(mp4, webp)

      if (!fs.existsSync(webp) || fs.statSync(webp).size === 0) {
        throw new Error('No se pudo generar el sticker WebP.')
      }

      // 📤 Enviar sticker animado
      await sock.sendMessage(
        msg.chat,
        {
          sticker: fs.readFileSync(webp),
          packname,
          author
        },
        { quoted: msg }
      )

      if (typeof msg.react === 'function') {
        await msg.react('✔️')
      }

    } catch (e) {
      console.error('❌ [ERROR] Comando bratv:', e)

      if (typeof msg.react === 'function') {
        await msg.react('✖️').catch(() => {})
      }

      await sock.sendMessage(
        msg.chat,
        {
          text: `⚠️ Se produjo un error al generar el sticker.\n> ${e.message || 'Error desconocido'}`
        },
        { quoted: msg }
      )

    } finally {
      // 🧹 Eliminar archivos temporales incluso si ocurre un error
      for (const file of [mp4, webp]) {
        if (file && fs.existsSync(file)) {
          try {
            fs.unlinkSync(file)
          } catch (err) {
            console.error('No se pudo eliminar el archivo temporal:', err.message)
          }
        }
      }
    }
  }
}
