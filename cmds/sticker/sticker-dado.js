import db from "#db"

export default {
  command: ['dado', 'dados', 'dadu'],
  category: 'game',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // Opciones del dado
      const opciones = ['1', '2', '3', '4', '5', '6'];

      // 1. Enviar la encuesta
      await sock.sendMessage(msg.chat, {
        poll: {
          name: '🎲 Dado (7 seg para votar)',
          values: opciones,
          selectableCount: 1
        }
      }, { quoted: msg });

      // Stickers del dado (URLs directas a imágenes webp)
      const stickdados = [
        'https://tinyurl.com/gdd01',
        'https://tinyurl.com/gdd02',
        'https://tinyurl.com/gdd003',
        'https://tinyurl.com/gdd004',
        'https://tinyurl.com/gdd05',
        'https://tinyurl.com/gdd006'
      ];

      // 2. Esperar 7 segundos
      await new Promise(resolve => setTimeout(resolve, 7000));

      // 3. Selección aleatoria
      const url = stickdados[Math.floor(Math.random() * stickdados.length)];

      // 4. Enviar sticker del dado
      // (En Baileys moderno, al enviar una URL como sticker, se descarga y se convierte automáticamente)
      await sock.sendMessage(msg.chat, {
        sticker: { url: url }
      }, { quoted: msg });

    } catch (e) {
      console.error('❌ [DADO ERROR]:', e.message);
      msg.reply('❌ Ocurrió un error al lanzar el dado.');
    }
  },
};
