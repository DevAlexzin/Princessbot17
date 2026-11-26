// Comando: saudio (sticker con audio)
// Uso: 
// 1. Responder a video con .saudio -> sticker animado + audio del video
// 2. Responder a imagen/sticker con .saudio -> inicia sesión de 60s, luego responder a audio/video para fusionar
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
      const isImage = /image/.test(mime) || /webp/.test(mime);
      const isAudio = /audio/.test(mime);

      // 1. Obtener información del usuario para packname/author
      let user = await db.getUser(msg.sender);
      const name = user.name || 'Usuario';
      let texto1 = user.metadatos || `S'Princess Bot`;
      let texto2 = user.metadatos2 || `@${name}`;
      let marca = args.join(' ').trim().split(/[\u2022|]/).map(p => p.trim());
      let pack = marca[0] || texto1;
      let author = marca.length > 1 ? marca[1] : texto2;

      // 2. Función: Convertir video a WebP (reutiliza tu lógica existente)
      const crearStickerVideo = async (buffer) => {
        return new Promise((resolve, reject) => {
          const tempInput = path.join(os.tmpdir(), `in_${Date.now()}.mp4`);
          const tempOutput = path.join(os.tmpdir(), `out_${Date.now()}.webp`);
          fs.writeFileSync(tempInput, buffer);

          ffmpeg(tempInput)
            .addOutputOptions([
              "-vcodec", "libwebp",
              "-vf", "scale=512:512:force_original_aspect_ratio=decrease,fps=15,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000",
              "-loop", "0", "-ss", "00:00:00.0", "-t", "00:00:05.0",
              "-preset", "default", "-an", "-vsync", "0"
            ])
            .toFormat('webp')
            .save(tempOutput)
            .on('end', () => {
              const buf = fs.readFileSync(tempOutput);
              fs.unlinkSync(tempInput); fs.unlinkSync(tempOutput);
              resolve(buf);
            })
            .on('error', (err) => {
              if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
              if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
              reject(err);
            });
        });
      };

      // 3. Función: Extraer audio de video a ogg/opus
      const extraerAudio = async (videoBuffer) => {
        return new Promise((resolve, reject) => {
          const tempIn = path.join(os.tmpdir(), `aud_in_${Date.now()}.mp4`);
          const tempOut = path.join(os.tmpdir(), `aud_out_${Date.now()}.ogg`);
          fs.writeFileSync(tempIn, videoBuffer);

          ffmpeg(tempIn)
            .addOutputOptions([
              "-vn",                // Sin video
              "-c:a", "libopus",    // Códec opus
              "-ac", "1",           // Mono
              "-ar", "48000",       // Sample rate
              "-avoid_negative_ts", "make_zero"
            ])
            .toFormat('ogg')
            .save(tempOut)
            .on('end', () => {
              const buf = fs.readFileSync(tempOut);
              fs.unlinkSync(tempIn); fs.unlinkSync(tempOut);
              resolve(buf);
            })
            .on('error', (err) => {
              if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
              if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
              reject(err);
            });
        });
      };

      // 4. Caso principal: usuario responde a video
      if (isVideo) {
        console.log("🎥 [DEBUG] Video detectado, generando sticker + audio...");

        // Verificar duración
        const seconds = (quoted.msg || quoted).seconds;
        if (seconds && seconds > 10) {
          return msg.reply('❖ El video no puede durar más de 10 segundos para hacer sticker con audio.');
        }

        const buffer = await quoted.download();

        // Generar sticker y audio en paralelo
        const [stickerBuffer, audioBuffer] = await Promise.all([
          crearStickerVideo(buffer),
          extraerAudio(buffer)
        ]);

        // Enviar sticker
        await sock.sendMessage(msg.chat, {
          sticker: stickerBuffer,
          packname: pack,
          author: author
        }, { quoted: msg });

        // Enviar audio (como mensaje de voz o audio normal)
        await sock.sendMessage(msg.chat, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true  // true = nota de voz, false = audio normal
        }, { quoted: msg });

        console.log("✅ [DEBUG] Sticker con audio enviado.");
        return;
      }

      // 5. Caso: usuario responde a imagen/sticker (solo sticker, sin audio aún)
      //    Se le indica que responda a un audio para completar
      if (isImage) {
        return msg.reply('❖ Responde a esta imagen con un audio/video para hacer sticker con sonido. O usa `.saudio` respondiendo directamente a un video.');
      }

      // 6. Si es audio solo, avisar
      if (isAudio) {
        return msg.reply('❖ Responde a un *video* con `.saudio` para obtener sticker + audio automáticamente. O responde a una *imagen* con `.saudio` primero.');
      }

      return msg.reply('❖ Envía o responde a un video con `.saudio` para crear sticker con su audio.');

    } catch (e) {
      console.error("❌ [DEBUG ERROR CRÍTICO saudio]:", e);
      return msg.reply("❌ Ocurrió un error al crear el sticker con audio.");
    }
  }
};
