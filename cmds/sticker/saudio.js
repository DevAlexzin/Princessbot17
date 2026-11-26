import db from "#db"
import crypto from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'
import fsp from 'fs/promises'
import nodePath from 'path'
import nodeOs from 'os'
import WebP from 'node-webpmux'
import { proto, prepareWAMessageMedia, downloadMediaMessage, normalizeMessageContent } from '@dnuzi/baileys'

const execFileAsync = promisify(execFile)

// --- CONFIGURACIÓN ---
const AUDIO_LIMIT_SEC = 25
const MAX_STICKER_BYTES = 880 * 1024

// --- PARCHE COMPLETO DEL PROTOBUF (basado en el Gist oficial de dnuzi) ---
function patchProtobuf(protoRoot) {
  const Msg = protoRoot?.Message
  if (!Msg || Msg.__audioStickerPatched) return
  
  if (Msg.StickerMessage) {
    const origStickerEncode = Msg.StickerMessage.encode
    Msg.StickerMessage.encode = function (message, writer) {
      const attached = message?.audioMessage
      if (attached) delete message.audioMessage
      const w = origStickerEncode.call(this, message, writer)
      if (attached && Msg.AudioMessage) {
        message.audioMessage = attached
        Msg.AudioMessage.encode(attached, w.uint32(210).fork()).ldelim()
      }
      return w
    }
    
    const origStickerFromObject = Msg.StickerMessage.fromObject
    if (typeof origStickerFromObject === 'function') {
      Msg.StickerMessage.fromObject = function (obj) {
        const out = origStickerFromObject.call(this, obj)
        if (obj?.audioMessage) {
          out.audioMessage = Msg.AudioMessage?.fromObject
            ? Msg.AudioMessage.fromObject(obj.audioMessage)
            : obj.audioMessage
        }
        return out
      }
    }
  }
  Msg.__audioStickerPatched = true
}
patchProtobuf(proto)

// --- FUNCIONES AUXILIARES ---
const SCALE_FILTER = 'scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1'

async function runFfmpeg(inputBuffer, inExt, outExt, args) {
  const tag = crypto.randomBytes(6).toString('hex')
  const src = nodePath.join(nodeOs.tmpdir(), `aud_${tag}.${inExt}`)
  const dst = nodePath.join(nodeOs.tmpdir(), `aud_${tag}_out.${outExt}`)
  try {
    await fsp.writeFile(src, inputBuffer)
    await execFileAsync('ffmpeg', ['-y', '-i', src, ...args, dst], { maxBuffer: 32 * 1024 * 1024 })
    return await fsp.readFile(dst)
  } finally {
    await fsp.unlink(src).catch(() => {})
    await fsp.unlink(dst).catch(() => {})
  }
}

async function videoToWebp(buffer) {
  const attempts = [[10, 50], [8, 36], [6, 24], [5, 16]]
  let result = null
  for (const [fps, quality] of attempts) {
    result = await runFfmpeg(buffer, 'mp4', 'webp', [
      '-t', String(AUDIO_LIMIT_SEC),
      '-vf', `fps=${fps},${SCALE_FILTER}`,
      '-c:v', 'libwebp',
      '-lossless', '0',
      '-compression_level', '6',
      '-q:v', String(quality),
      '-loop', '0',
      '-preset', 'picture',
      '-an',
      '-vsync', '0'
    ])
    if (result.length <= MAX_STICKER_BYTES) break
  }
  return result
}

function buildExif(pack, author) {
  const meta = {
    'sticker-pack-id': `audio.sticker.${crypto.randomBytes(4).toString('hex')}`,
    'sticker-pack-name': pack,
    'sticker-pack-publisher': author,
    emojis: ['🔊']
  }
  const header = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00])
  const json = Buffer.from(JSON.stringify(meta), 'utf-8')
  const exif = Buffer.concat([header, json])
  exif.writeUIntLE(json.length, 14, 4)
  return exif
}

async function buildVoiceNote(sock, buffer, ext, fallbackSec = 0) {
  const data = await runFfmpeg(buffer, ext, 'ogg', [
    '-vn', '-map', '0:a:0',
    '-t', String(AUDIO_LIMIT_SEC),
    '-af', 'aresample=48000:async=1:first_pts=0',
    '-c:a', 'libopus', '-b:a', '48k', '-vbr', 'on',
    '-compression_level', '10', '-ac', '1', '-ar', '48000',
    '-application', 'audio', '-avoid_negative_ts', 'make_zero', '-f', 'ogg'
  ])
  if (data.length < 200) throw new Error('Audio vacío o demasiado corto.')
  
  const { audioMessage } = await prepareWAMessageMedia(
    { audio: data, mimetype: 'audio/ogg; codecs=opus', ptt: true },
    { upload: sock.waUploadToServer }
  )
  audioMessage.seconds = Math.max(1, Math.min(AUDIO_LIMIT_SEC, Math.round(fallbackSec || 5)))
  audioMessage.ptt = true
  audioMessage.mimetype = 'audio/ogg; codecs=opus'
  if (!audioMessage.waveform?.length) {
    audioMessage.waveform = Buffer.from(Array.from({ length: 64 }, (_, i) => 18 + (data[(i * 19 + 7) % data.length] % 76)))
  }
  return audioMessage
}

// --- COMANDO ---
export default {
  command: ['saudio', 'stickeraudio'],
  category: 'stickers',
  run: async ({ msg, sock, args }) => {
    try {
      const quoted = msg.quoted ? msg.quoted : msg
      const content = normalizeMessageContent(quoted.message || quoted)
      
      // Detectar si es video
      let videoBuffer = null
      let seconds = 0
      
      if (content?.videoMessage) {
        videoBuffer = await downloadMediaMessage(quoted, 'buffer', {}, { logger: sock.logger, reuploadRequest: sock.updateMediaMessage })
        seconds = content.videoMessage.seconds || 0
      } else {
        return msg.reply('❖ Responde a un *video* con `.saudio` para crear un sticker con audio.')
      }

      if (seconds > AUDIO_LIMIT_SEC) {
        return msg.reply(`❖ El video no puede durar más de ${AUDIO_LIMIT_SEC} segundos.`)
      }

      // Metadatos del pack
      let user = await db.getUser(msg.sender)
      const name = user.name || 'Usuario'
      let pack = args[0] || user.metadatos || `S'Princess Bot`
      let author = args[1] || user.metadatos2 || `@${name}`

      // 1. Convertir video a WebP (sin audio)
      const webpData = await videoToWebp(videoBuffer)
      
      // 2. Inyectar EXIF
      const img = new WebP.Image()
      await img.load(webpData)
      img.exif = buildExif(pack, author)
      const stickerBuffer = await img.save(null)

      // 3. Extraer audio como nota de voz
      const audioMessage = await buildVoiceNote(sock, videoBuffer, 'mp4', seconds)

      // 4. ENVIAR: sticker con audioMessage adjunto (el parche lo empaqueta)
      await sock.sendMessage(msg.chat, {
        sticker: stickerBuffer,
        audioMessage: audioMessage
      }, { quoted: msg })

    } catch (e) {
      console.error("❌ [saudio ERROR]:", e)
      return msg.reply("❌ Ocurrió un error al crear el sticker con audio.")
    }
  }
}
