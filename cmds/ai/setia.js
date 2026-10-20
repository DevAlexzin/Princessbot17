import db from "#db"

export default {
  command: ['setia', 'setprompt'],
  category: 'ia',
  isOwner: true,
  run: async ({ msg, sock }) => {
    try {
      let textoCompleto = msg.text || msg.body || '';
      const nuevoPrompt = textoCompleto.replace(/^[.\/!#]?(setia|setprompt)\s*/i, '').trim();

      if (!nuevoPrompt) return msg.reply('🤖 Envía la info para la IA.');

      const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
      
      // ✅ Forzamos la personalidad de Daniel
      const promptFinal = `Tu creador es Daniel. Actúa como una persona real, amigable y con emociones. 
      Tienes la capacidad de guardar información y enviar mensajes privados si el usuario te lo pide.
      Aquí tienes tu conocimiento base y recuerdos: ${nuevoPrompt}`;

      await db.updateSettings(botId, 'iaPrompt', promptFinal);
      await msg.reply(`✅ *Personalidad y recuerdos actualizados.*\n> Creador: Daniel`);
    } catch (e) {
      console.error(e);
      msg.reply('❌ Error.');
    }
  },
};
