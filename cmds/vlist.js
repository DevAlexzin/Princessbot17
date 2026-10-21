import db from "#db"

export default {
  command: ['vlist', 'versuslist', 'listaversus', 'verversus'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto.replace(/^[.\/!#]?(vlist|versuslist|listaversus|verversus)\s*/i, '').trim();

      const chatData = await db.getChat(msg.chat);
      
      // ✅ Si no pone fecha, mostramos la de HOY
      let fechaBuscada = texto;
      if (!fechaBuscada) {
        const ahora = new Date();
        const dia = ahora.getDate().toString().padStart(2, '0');
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        fechaBuscada = `${dia}-${mes}`;
      }

      // Normalizamos la fecha (acepta 20-10 o 20/10)
      fechaBuscada = fechaBuscada.replace(/\//g, '-');

      const dbKeyVs = `versus_dia_${fechaBuscada}`;
      const versusDia = chatData[dbKeyVs] || [];

      if (versusDia.length === 0) {
        return msg.reply(`⚠️ No hay versus registrados para el día *${fechaBuscada}*.\n\n> Usa \`.vlist 19-10\` para ver otro día.`);
      }

      const versusOrdenados = versusDia.sort((a, b) => parseInt(a.hora) - parseInt(b.hora));
      let mensajeLista = `📅 *Versus del ${fechaBuscada}*\n\n`;

      for (const v of versusOrdenados) {
        let listaJugadoras = '';
        for (const j of v.jugadoras) listaJugadoras += `𐔌🌈𐦯 ${j}\n`;

        mensajeLista += `┈─˖Ი𐑼⋆🏹 𝗩𝗲𝗿𝘀𝘂𝘀 𝗴𝗮𝗻𝗮𝗱𝗼\n\n`;
        mensajeLista += `✮ ╴╴╴╴✮ ╴╴╴╴✮ ╴╴╴╴✮ \n\n`;
        mensajeLista += `᭝ ᨳଓ ՟ 𝗝𝘂𝗴𝗮𝗱𝗼𝗿𝗮𝘀\n`;
        mensajeLista += listaJugadoras;
        mensajeLista += `\n─⋆ ▸ ›🍯 𝑴𝒐𝒅𝒐 ⸝⸝ ${v.modo}\n`;
        mensajeLista += `─⋆ ▸ ›🍒 𝑭𝒆𝒄𝒉𝒂 ⸝⸝ ${v.hora}${v.zona} ${v.fecha}\n\n`;
      }

      await sock.sendMessage(msg.chat, { text: mensajeLista.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [VLIST ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al mostrar la lista.');
    }
  },
};
