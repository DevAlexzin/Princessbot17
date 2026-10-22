import db from "#db"

export default {
  command: ['loss', 'lost', 'black', 'perdido'], // ✅ Ahora responde a loss/lost
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      // ✅ Actualizamos el regex para que reconozca las nuevas palabras
      let texto = textoCompleto.replace(/^[.\/!#]?(loss|lost|black|perdido)\s*/i, '').trim();

      if (!texto) {
        return msg.reply(`💀 *Anotar Versus Perdido*

*📋 Formato:*
\`.loss @rival Resultado Fecha\`

*📌 Ejemplo:*
\`.loss @psycho 0-2 29/10\``);
      }

      const fechaMatch = texto.match(/(\d{1,2}\/\d{1,2})/);
      let fecha = fechaMatch ? fechaMatch[1] : '';
      
      if (!fecha) {
        const ahora = new Date();
        const dia = ahora.getDate().toString().padStart(2, '0');
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        fecha = `${dia}/${mes}`;
      }

      const resultadoMatch = texto.match(/(\d+)\s*-\s*(\d+)/);
      if (!resultadoMatch) {
        return msg.reply('❌ No se detectó el resultado. Usa el formato `0-2` (tus goles - sus goles).');
      }

      let rivalNombre = texto
        .replace(/(\d{1,2}\/\d{1,2})/g, '')
        .replace(/(\d+)\s*-\s*(\d+)/g, '')
        .trim();

      if (rivalNombre && !rivalNombre.startsWith('@')) {
        rivalNombre = '@' + rivalNombre;
      }

      if (!rivalNombre) {
        return msg.reply('❌ Debes escribir el nombre o @ del rival.');
      }

      const rivalKey = rivalNombre.toLowerCase().replace(/[^a-z0-9@]/g, '');

      const chatData = await db.getChat(msg.chat);
      const dbKey = `versus_rivales_${msg.chat}`;
      let rivalesData = chatData[dbKey] || {};

      if (!rivalesData[rivalKey]) {
        rivalesData[rivalKey] = { nombre: rivalNombre, ganados: [], perdidos: [] };
      }

      rivalesData[rivalKey].perdidos.push(fecha);
      await db.updateChat(msg.chat, dbKey, rivalesData);

      // ✅ ARMAMOS LA LISTA CON TODOS LOS RIVALES
      let mensajeLista = `┈─˖Ი𐑼⋆ 𝗥𝗶𝘃𝗮𝗹𝗲𝘀 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱\n\n`;

      for (const [key, data] of Object.entries(rivalesData)) {
        let listaGanados = data.ganados.length > 0 ? data.ganados.join(' ') : 'Ninguno';
        let listaPerdidos = data.perdidos.length > 0 ? data.perdidos.join(' ') : 'Ninguno';

        mensajeLista += `ᨳ ▸ ›𝐑𝐢𝐯𝐚𝐥\n${data.nombre}\n\n`;
        mensajeLista += `ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ\n\n`;
        mensajeLista += `᭝ 🏹 ՟ Gᥲᥒᥲdos ┆ ${listaGanados}\n\n`;
        mensajeLista += `᭝ 🌈 ՟ Pᥱrdιdos ┆ ${listaPerdidos}\n\n`;
      }

      mensajeLista += `               ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु`;

      await sock.sendMessage(msg.chat, { text: mensajeLista.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [LOSS ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al anotar el versus perdido.');
    }
  },
};
