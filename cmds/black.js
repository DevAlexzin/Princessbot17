import db from "#db"

export default {
  command: ['black', 'anotarblack', 'perdido'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      let texto = textoCompleto.replace(/^[.\/!#]?(black|anotarblack|perdido)\s*/i, '').trim();

      if (!texto) {
        return msg.reply(`💀 *Anotar Versus Perdido*

*📋 Formato:*
\`.black @rival Resultado Fecha\`

*📌 Ejemplo:*
\`.black @psycho 0-2 29/10\``);
      }

      // ✅ Buscamos la fecha
      const fechaMatch = texto.match(/(\d{1,2}\/\d{1,2})/);
      let fecha = fechaMatch ? fechaMatch[1] : '';
      
      if (!fecha) {
        const ahora = new Date();
        const dia = ahora.getDate().toString().padStart(2, '0');
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        fecha = `${dia}/${mes}`;
      }

      // ✅ Buscamos el resultado
      const resultadoMatch = texto.match(/(\d+)\s*-\s*(\d+)/);
      if (!resultadoMatch) {
        return msg.reply('❌ No se detectó el resultado. Usa el formato `0-2` (ganados-perdidos).');
      }

      // ✅ Extraemos el nombre del rival
      let rivalNombre = texto
        .replace(/(\d{1,2}\/\d{1,2})/g, '')
        .replace(/(\d+)\s*-\s*(\d+)/g, '')
        .trim();

      if (rivalNombre && !rivalNombre.startsWith('@')) {
        rivalNombre = '@' + rivalNombre;
      }

      if (!rivalNombre) {
        return msg.reply('❌ Debes escribir el nombre o @ del rival.\n\n*Ejemplo:* `.black @psycho 0-2 29/10`');
      }

      const rivalKey = rivalNombre.toLowerCase().replace(/[^a-z0-9@]/g, '');

      // Guardamos
      const chatData = await db.getChat(msg.chat);
      const dbKey = `versus_rivales_${msg.chat}`;
      let rivalesData = chatData[dbKey] || {};

      if (!rivalesData[rivalKey]) {
        rivalesData[rivalKey] = { nombre: rivalNombre, ganados: [], perdidos: [] };
      }

      rivalesData[rivalKey].perdidos.push(fecha);
      await db.updateChat(msg.chat, dbKey, rivalesData);

      // Diseño
      let listaGanados = rivalesData[rivalKey].ganados.length > 0 
        ? rivalesData[rivalKey].ganados.join(' ') 
        : 'Ninguno';
      let listaPerdidos = rivalesData[rivalKey].perdidos.join(' ');

      const mensajeLista = `┈─˖Ი𐑼⋆ 𝗥𝗶𝘃𝗮𝗹𝗲𝘀 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

ᨳ ▸ ›𝐑𝐢𝐯𝐚𝐥
${rivalesData[rivalKey].nombre}

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

᭝ 🏹 ՟ Gᥲᥒᥲdos ┆ ${listaGanados}

᭝ 🌈 ՟ Pᥱrdιdos ┆ ${listaPerdidos}

               ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु`;

      await sock.sendMessage(msg.chat, { text: mensajeLista.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [BLACK ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al anotar el versus perdido.');
    }
  },
};
