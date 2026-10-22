import db from "#db"

export default {
  command: ['win', 'anotarwin', 'ganado'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto.replace(/^[.\/!#]?(win|anotarwin|ganado)\s*/i, '').trim();

      if (!texto) {
        return msg.reply(`🏆 *Anotar Versus Ganado*

*📋 Formato:*
\`.win @rival Resultado Fecha\`

*📌 Ejemplo:*
\`.win @psycho 2-0 29/10\``);
      }

      // ✅ DETECCIÓN ROBUSTA DE MENCIONES (Como en los otros comandos)
      let menciones = [];
      if (msg.mentionedJid?.length > 0) menciones = msg.mentionedJid;
      else if (msg.mentions?.length > 0) menciones = msg.mentions;
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        menciones = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }
      else if (msg.message?.contextInfo?.mentionedJid) {
        menciones = msg.message.contextInfo.mentionedJid;
      }

      if (menciones.length === 0) {
        return msg.reply('❌ Debes mencionar al rival.\n\n*Ejemplo:* `.win @psycho 2-0 29/10`');
      }
      
      const rivalId = menciones[0];
      const rivalNum = rivalId.split('@')[0];

      // Extraemos el texto sin la mención
      let textoSinMencion = texto.replace(/@\d{8,15}/g, '').trim();
      
      // Buscamos la fecha
      const fechaMatch = textoSinMencion.match(/(\d{1,2}\/\d{1,2})/);
      let fecha = fechaMatch ? fechaMatch[1] : '';
      
      if (!fecha) {
        const ahora = new Date();
        const dia = ahora.getDate().toString().padStart(2, '0');
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        fecha = `${dia}/${mes}`;
      }

      // Guardamos
      const chatData = await db.getChat(msg.chat);
      const dbKey = `versus_rivales_${msg.chat}`;
      let rivalesData = chatData[dbKey] || {};

      if (!rivalesData[rivalNum]) {
        rivalesData[rivalNum] = { ganados: [], perdidos: [] };
      }

      rivalesData[rivalNum].ganados.push(fecha);
      await db.updateChat(msg.chat, dbKey, rivalesData);

      // Diseño
      let listaGanados = rivalesData[rivalNum].ganados.join(' ');
      let listaPerdidos = rivalesData[rivalNum].perdidos.length > 0 
        ? rivalesData[rivalNum].perdidos.join(' ') 
        : 'Ninguno';

      const mensajeLista = `┈─˖Ი𐑼⋆ 𝗥𝗶𝘃𝗮𝗹𝗲𝘀 𝗣𝘀𝘆𝗰𝗵𝗼 𝗟𝗮𝗻𝗱

ᨳ ▸ ›𝐑𝐢𝐯𝐚𝐥
@${rivalNum}

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

᭝ 🏹 ՟ Gᥲᥒᥲdos ┆ ${listaGanados}

᭝ 🌈 ՟ Pᥱrdιdos ┆ ${listaPerdidos}

               ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु`;

      await sock.sendMessage(msg.chat, {
        text: mensajeLista.trim(),
        mentions: menciones // ✅ Enviamos la mención real para que se vea azul
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [WIN ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al anotar el versus ganado.');
    }
  },
};
