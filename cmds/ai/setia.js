import db from "#db"

export default {
  command: ['setia', 'setprompt'],
  category: 'ia',
  isOwner: true,
  run: async ({ msg, sock }) => {
    try {
      let textoCompleto = msg.text || msg.body || '';
      const nuevoPrompt = textoCompleto
        .replace(/^[.\/!#]?(setia|setprompt)\s*/i, '')
        .trim();

      if (!nuevoPrompt) {
        return msg.reply(`🤖 *Configurar IA*

*📋 Uso:*
\`.setia [Texto con toda la información]\`

*📌 Ejemplo:*
\`.setia Eres el asistente de Princess Bot. Tus comandos son: .reg para registrar, .perfil para ver...\`

> 💡 Envía toda la info junto. Usa \`\\n\` para saltos de línea.`);
      }

      // Lo guardamos en la base de datos del bot
      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      await db.updateSettings(botId, 'iaPrompt', nuevoPrompt);

      await msg.reply(`✅ *Información de la IA actualizada*

> 📝 Se guardaron ${nuevoPrompt.length} caracteres de información.
> 💡 Ahora la IA usará esto para responder cuando la mencionen.`);

    } catch (e) {
      console.error("❌ [SETIA ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error.');
    }
  },
};
