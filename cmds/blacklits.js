import db from "#db"

export default {
  command: ['black', 'blacklist', 'listanegra'],
  category: 'grupo',
  isAdmin: true, // ✅ Solo admins pueden vetar rivales
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      let texto = textoCompleto.replace(/^[.\/!#]?(black|blacklist|listanegra)\s*/i, '').trim();

      if (!texto) {
        return msg.reply(`⛔ *Lista Negra de Rivales*

*📋 Formato para vetar:*
\`.black @rival1 @rival2\`

*📌 Ejemplo:*
\`.black @psycho @pepitas\`

> 💡 Los rivales anotados aquí aparecerán en la lista negra.`);
      }

      // ✅ DETECCIÓN ROBUSTA DE MENCIONES
      let menciones = [];
      if (msg.mentionedJid?.length > 0) menciones = msg.mentionedJid;
      else if (msg.mentions?.length > 0) menciones = msg.mentions;
      else if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
        menciones = msg.message.extendedTextMessage.contextInfo.mentionedJid;
      }
      else if (msg.message?.contextInfo?.mentionedJid) {
        menciones = msg.message.contextInfo.mentionedJid;
      }

      const chatData = await db.getChat(msg.chat);
      const dbKey = `blacklist_${msg.chat}`;
      let blacklist = chatData[dbKey] || [];

      // ✅ SI HAY MENCIONES, LOS AGREGAMOS A LA LISTA
      if (menciones.length > 0) {
        for (const mencion of menciones) {
          const num = mencion.split('@')[0];
          if (!blacklist.includes(num)) {
            blacklist.push(num);
          }
        }
        await db.updateChat(msg.chat, dbKey, blacklist);
        console.log(`✅ [BLACKLIST] Agregados: ${menciones.length} rivales.`);
      }

      if (blacklist.length === 0) {
        return msg.reply('⚠️ *La lista negra está vacía.*\n\n> Usa `.black @rival` para agregar rivales vetados.');
      }

      // ✅ ARMAMOS LA LISTA VISUAL
      let mensajeLista = `┈─˖Ი𐑼⋆ 𝗥𝗶𝘃𝗮𝗹𝗲𝘀 𝗕𝗹𝗼𝗾𝘂𝗲𝗮𝗱𝗼𝘀\n\n`;

      for (const num of blacklist) {
        mensajeLista += `ᨳ ▸ ›𝐑𝐢𝐯𝐚𝐥\n@${num}\n\n`;
      }

      mensajeLista += `ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ\n\n`;
      mensajeLista += `> ⛔ Estos rivales no deberían jugar.`;
      mensajeLista += `\n\n               ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु`;

      // Enviamos la lista con las menciones resaltadas
      const mentionsFinal = blacklist.map(num => num + '@s.whatsapp.net');

      await sock.sendMessage(msg.chat, {
        text: mensajeLista.trim(),
        mentions: mentionsFinal
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [BLACKLIST ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar la lista negra.');
    }
  },
};
