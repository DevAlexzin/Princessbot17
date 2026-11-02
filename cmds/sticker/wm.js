import db from "#db"
import fs from 'fs'
import path from 'path'
import exif from '../../lib/exif.js'
const { writeExif } = exif

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

      // 2. Separamos el texto
      let [packname, ...author] = (text || '').split('|');
      packname = (packname || '').trim() || 'Princess Bot';
      author = (author || []).join('|').trim() || 'WhatsApp';

      // 3. Descargamos el sticker
      const imgBuffer = await quoted.download();
      if (!imgBuffer) {
        return msg.reply('✎ No se pudo descargar el sticker.');
      }

      // ✅ 4. CREAMOS LA CARPETA TEMPORAL PARA EVITAR EL ERROR ENOENT
      const tmpDir = path.join(process.cwd(), 'lib', 'system', 'tmp');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }

      console.log(`🏷️ [WM] Agregando metadatos: Pack="${packname}", Autor="${author}"`);

      // ✅ 5. Usamos writeExif que sí guarda los metadatos como los lee WhatsApp
      const media = { mimetype: mime, data: imgBuffer }
      const metadata = { packname: packname, author: author, categories: [''] }
      
      const stickerPath = await writeExif(media, metadata)

      if (!stickerPath) {
        return msg.reply('✎ No se pudo procesar el sticker.');
      }

      // 6. Enviamos el sticker
      await sock.sendMessage(msg.chat, {
        sticker: { url: stickerPath }
      }, { quoted: msg });

      // 7. Borramos el archivo temporal
      if (fs.existsSync(stickerPath)) {
        fs.unlinkSync(stickerPath);
      }

      console.log('✅ [WM] Sticker con metadatos enviado.');

    } catch (e) {
      console.error("❌ [WM ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el sticker.');
    }
  }
};
