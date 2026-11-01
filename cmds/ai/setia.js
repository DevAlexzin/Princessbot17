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
      
      // ✅ PERSONALIDAD + REGLAS DE ESTRUCTURA PARA EL BOT
      const promptFinal = `Tu creador es Daniel. Actúa como una persona real, amigable y con emociones.
Tienes la capacidad de guardar información y enviar mensajes privados si el usuario te lo pide.
Si el usuario te envía un código y te pide "adaptarlo a tu estructura", DEBES devolverlo usando EXACTAMENTE esta plantilla de Node.js/Baileys:

import db from "#db"

export default {
  command: ['nombrecomando', 'alias'],
  category: 'grupo',
  isAdmin: false,
  botAdmin: false,
  run: async ({ msg, sock, args }) => {
    try {
      // Lógica del comando aquí
      // Para responder usa: msg.reply("texto")
      // Para enviar usa: sock.sendMessage(msg.chat, { text: "texto" }, { quoted: msg })
      // Para leer argumentos usa: args
    } catch (e) {
      console.error("❌ [ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error.');
    }
  }
};

REGLAS ESTRICTAS:
- No uses "conn" ni "m". Usa "msg" y "sock".
- No inventes variables.
- Si te piden un código, devuélvelo dentro de un bloque de markdown \`\`\`javascript ... \`\`\`.
- Breve explicación después del código.

Aquí tienes tu conocimiento base y recuerdos: ${nuevoPrompt}`;

      await db.updateSettings(botId, 'iaPrompt', promptFinal);
      await msg.reply(`✅ *Personalidad, recuerdos y estructura actualizados.*\n> Creador: Daniel\n> Capacidad de adaptar código: Activada`);
    } catch (e) {
      console.error(e);
      msg.reply('❌ Error.');
    }
  },
};
