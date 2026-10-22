import db from "#db"

export default {
  command: ['black', 'blacklist', 'listanegra'],
  category: 'grupo',
  isAdmin: true, 
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      let texto = textoCompleto.replace(/^[.\/!#]?(black|blacklist|listanegra)\s*/i, '').trim();

      // ✅ Si no hay texto, mostrar la lista actual
      if (!texto) {
        const chatData = await db.getChat(msg.chat);
        const blacklist = chatData[`blacklist_${msg.chat}`] || [];

        if (blacklist.length === 0) {
          return msg.reply('⚠️ *La lista negra está vacía.*\n\n> Usa `.black @rival` para agregar rivales vetados.');
        }

        let mensajeLista = `᭝ 🌈 ՟ 𝓑𝓵𝓪𝓬𝓴 𝓵𝓲𝓼𝓽 𝓟𝓼𝔂𝓬𝓱𝓸 𝓛𝓪𝓷𝓭\n\n`;
        mensajeLista += `ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ\n\n`;

        for (const rival of blacklist) {
          mensajeLista += `ᨳ ▸ › ${rival}\n`;
        }

        mensajeLista += `\nꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ`;

        return sock.sendMessage(msg.chat, { text: mensajeLista.trim() }, { quoted: msg });
      }

      // ✅ LÓGICA PARA AGREGAR RIVALES POR TEXTO
      const chatData = await db.getChat(msg.chat);
      const dbKey = `blacklist_${msg.chat}`;
      let blacklist = chatData[dbKey] || [];

      // Separamos el texto por espacios o comas para aceptar varios rivales a la vez
      const nuevosRivales = texto.split(/[\s,]+/).map(r => r.trim()).filter(r => r !== '');
      
      let agregados = 0;
      let yaEstaban = 0;

      for (const rival of nuevosRivales) {
        // Normalizamos para que todos tengan @ al inicio
        let rivalFormat = rival.startsWith('@') ? rival : `@${rival}`;
        
        // Verificamos si ya está en la lista (ignorando mayúsculas/minúsculas)
        const existe = blacklist.some(r => r.toLowerCase() === rivalFormat.toLowerCase());
        
        if (!existe) {
          blacklist.push(rivalFormat);
          agregados++;
        } else {
          yaEstaban++;
        }
      }

      if (agregados > 0) {
        await db.updateChat(msg.chat, dbKey, blacklist);
      }

      // ✅ MOSTRAMOS LA LISTA COMPLETA ACTUALIZADA
      let mensajeLista = `᭝ 🌈 ՟ 𝓑𝓵𝓪𝓬𝓴 𝓵𝓲𝓼𝓽 𝓟𝓼𝔂𝓬𝓱𝓸 𝓛𝓪𝓷𝓭\n\n`;
      mensajeLista += `ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ\n\n`;

      for (const rival of blacklist) {
        mensajeLista += `ᨳ ▸ › ${rival}\n`;
      }

      mensajeLista += `\nꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ`;
      
      if (agregados > 0) {
        mensajeLista += `\n\n> ✅ Se agregaron ${agregados} rival(es) a la lista.`;
      }
      if (yaEstaban > 0) {
        mensajeLista += `\n> ⚠️ ${yaEstaban} rival(es) ya estaban en la lista.`;
      }

      await sock.sendMessage(msg.chat, { text: mensajeLista.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [BLACKLIST ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar la lista negra.');
    }
  },
};
