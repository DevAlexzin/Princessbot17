import db from "#db"
import fs from 'fs'
import path from 'path'
import exif from '../../lib/exif.js' // ✅ Ruta correcta a tu carpeta lib
const { addExif } = exif

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
      author = (author || []).join('|');

      // 3. Descargamos el sticker
      const img = await quoted.download();
      if (!img) {
        return msg.reply('✎ No se pudo descargar el sticker.');
      }

      // 4. Añadimos los metadatos con la función addExif
      console.log(`🏷️ [WM] Agregando metadatos: Pack="${packname}", Autor="${author}"`);
      
      const stickerBuffer = await addExif(img, packname.trim(), author.trim());

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
