import db from "#db"

export default {
  command: ['autoadmin', 'auto'],
  category: 'socket',
  isOwner: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      const chatData = await db.getChat(msg.chat);
      const estadoActual = chatData.autoadmin === true;

      // ✅ Si ya está activado, lo desactivamos
      if (estadoActual) {
        await db.updateChat(msg.chat, 'autoadmin', false);
        return msg.reply(`❌ *Auto-Admin desactivado*

> 🤖 El bot ya NO se promocionará como admin al ser agregado.`);
      }

      // ✅ Si no está activado, lo activamos
      await db.updateChat(msg.chat, 'autoadmin', true);
      return msg.reply(`✅ *Auto-Admin activado*

> 🤖 A partir de ahora, el bot se promocionará automáticamente como admin cuando sea agregado a un grupo.`);

    } catch (e) {
      console.error("❌ [AUTOADMIN ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al procesar el comando.');
    }
  },
};
