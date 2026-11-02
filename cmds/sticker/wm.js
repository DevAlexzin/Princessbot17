import db from "#db"
import sharp from "sharp"

export default {
  command: ['take', 'wm', 'marca'],
  category: 'stickers',
  botAdmin: false,
  run: async ({ msg, sock, text }) => {
    try {
      // 1. Verificamos que esté respondiendo a un sticker
      const quoted = msg.quoted;
      
      if (!quoted) {
        return msg.reply('✎ Responde al sticker con algún texto para colocar en el packname.');
      }

      const mime = (quoted.msg || quoted).mimetype || '';
      if (!/webp/.test(mime)) {
        return msg.reply('✎ Responde a un *sticker* válido.');
      }

      // 2. Separamos el texto por "|" para obtener Packname y Autor
      let [packname, ...author] = (text || '').split('|');
      packname = (packname || '').trim();
      author = (author || []).join('|').trim();

      console.log(`🏷️ [WM] Agregando metadatos: Pack="${packname}", Autor="${author}"`);

      // 3. Descargamos el sticker a memoria (sin archivos temporales)
      const imgBuffer = await quoted.download();
      if (!imgBuffer) {
        return msg.reply('✎ No se pudo descargar el sticker.');
      }

      // 4. Usamos sharp para inyectar los metadatos EXIF
      const stickerBuffer = await sharp(imgBuffer)
        .webp({ quality: 80 })
        .withMetadata({
          exif: {
            IFD0: {
              ImageDescription: packname,
              Artist: author
            }
          }
        })
        .toBuffer();

      if (!stickerBuffer) {
        return msg.reply('✎ No se pudo procesar el sticker.');
      }

      // 5. Enviamos el sticker modificado
      await sock.sendMessage(msg.chat, {
        sticker: stickerBuffer
      }, { quoted: msg });

      console.log('✅ [WM] Sticker con metadatos enviado.');

    } catch (e) {
      console.error("❌ [WM ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el sticker.');
    }
  }
};
