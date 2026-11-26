import db from "#db"
import fs from 'fs'
import os from 'os'
import path from 'path'
import crypto from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'
import WebP from 'node-webpmux'
import pkg from '@dnuzi/baileys'
const { proto } = pkg

const execFileAsync = promisify(execFile)

// --- PARCHE CRÍTICO PARA EL PROTOBUF ---
// Esto le enseña a la librería cómo empaquetar el audio dentro del sticker
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
  }
}
patchProtobuf(proto)

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

      // 1. Obtener metadatos del usuario
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
      if (seconds && seconds > 25) { // El límite del audio suele ser 25s
        return msg.reply('❖ El video es demasiado largo (máx. 25s).');
      }

      const buffer = await quoted.download();
      
      const tempIn = path.join(os.tmpdir(), `in_${Date.now()}.mp4`);
      const tempWebp = path.join(os.tmpdir(), `out_${Date.now()}.webp`); 
      const tempAudio = path.join(os.tmpdir(), `aud_${Date.now()}.ogg`);
      
      fs.writeFileSync(tempIn, buffer);

      // 2. Convertir a WebP SIN audio (el audio va por separado)
      await execFileAsync('ffmpeg', [
        '-y', '-i', tempIn,
        '-t', '5', // Límite de duración del sticker visual
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000',
        '-c:v', 'libwebp',
        '-lossless', '0',
        '-compression_level', '6',
        '-q:v', '50',
        '-loop', '0',
        '-an', // Sin audio aquí
        tempWebp
      ]);

      // 3. Extraer el audio a formato OGG/Opus
      await execFileAsync('ffmpeg', [
        '-y', '-i', tempIn,
        '-t', '25',
        '-vn',
        '-c:a', 'libopus',
        '-b:a', '48k',
        '-ac', '1',
        '-ar', '48000',
        tempAudio
      ]);

      const stickerBuffer = fs.readFileSync(tempWebp);
      const audioBuffer = fs.readFileSync(tempAudio);

      // 4. Inyectar metadatos EXIF al sticker (nombre del pack)
      const img = new WebP.Image();
      await img.load(stickerBuffer);
      
      const json = {
        "sticker-pack-id": `com.alisa.bot.${crypto.randomBytes(4).toString('hex')}`,
        "sticker-pack-name": pack,
        "sticker-pack-publisher": author,
        "emojis": ["🔊"]
      };
      
      const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
      const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
      const exif = Buffer.concat([exifAttr, jsonBuff]);
      exif.writeUIntLE(jsonBuff.length, 14, 4);
      
      img.exif = exif;
      const finalSticker = await img.save(null);

      // 5. Preparar el mensaje de audio para adjuntarlo
      const { audioMessage } = await pkg.prepareWAMessageMedia(
        { audio: audioBuffer, mimetype: 'audio/ogg; codecs=opus', ptt: true },
        { upload: sock.waUploadToServer }
      );
      
      // Ajustar la duración del audio
      audioMessage.seconds = Math.min(25, seconds || 5);
      audioMessage.ptt = true;

      // 6. Enviar el sticker con el audio ADJUNTO (La clave está aquí)
      await sock.sendMessage(msg.chat, { 
        sticker: finalSticker,
        // Al inyectar esto, la librería parcheada lo empaquetará correctamente
        audioMessage: audioMessage 
      }, { quoted: msg });

      // Limpieza
      [tempIn, tempWebp, tempAudio].forEach(f => { if (fs.existsSync(f)) fs.unlinkSync(f); });

      console.log("✅ [DEBUG] Sticker con audio enviado correctamente.");
      
    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO saudio]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker con audio. Revisa la consola.");
    }
  }
};
