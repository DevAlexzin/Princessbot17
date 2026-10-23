import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['codigo', 'code', 'programar'],
  category: 'ia',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      console.log("========================================");
      console.log("💻 [DEBUG] Comando 'codigo' ejecutado.");
      console.log("========================================");

      let textoCompleto = msg.text || msg.body || '';
      const consulta = textoCompleto
        .replace(/^[.\/!#]?(codigo|code|programar)\s*/i, '')
        .trim();

      if (!consulta) {
        return msg.reply(`💻 *Ayuda de Programación*

*📋 Uso:* \`.codigo tarea\`

*📌 Ejemplos:*
> \`.codigo comando de kick\`
> \`.codigo comando para stickers\`
> \`.codigo comando de ruleta\`

> 💡 *Nota:* La IA generará el código con la estructura exacta de Princess Bot.`);
      }

      console.log(`💻 [CODIGO] Consulta: ${consulta}`);

      // ✅ SYSTEM PROMPT CON LA ESTRUCTURA EXACTA DEL BOT
      const promptSistema = `Eres un programador experto en crear comandos para un bot de WhatsApp hecho con Node.js y Baileys.
El usuario te pedirá que crees un comando. DEBES responder SIEMPRE con la estructura exacta que usa este bot, que es la siguiente:

import db from "#db"

export default {
  command: ['nombrecomando', 'alias'],
  category: 'grupo',
  isAdmin: false,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      // Lógica del comando
      // Para responder: msg.reply("texto")
      // Para enviar mensajes: sock.sendMessage(msg.chat, { text: "texto" }, { quoted: msg })
      // Para obtener el texto: msg.text o msg.body
      // Para mencionar: msg.mentionedJid
    } catch (e) {
      console.error("❌ [ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error.');
    }
  }
};

REGLAS ESTRICTAS:
1. Usa SIEMPRE la estructura de arriba. No uses "module.exports", no uses "conn", no uses "m", usa "msg" y "sock".
2. La categoría por defecto es 'grupo' (o 'info', 'fun', 'search', 'download', 'ia', 'sticker' según corresponda).
3. Si es un comando de admin, pon isAdmin: true. Si el bot debe ser admin, pon botAdmin: true.
4. No inventes variables que no existan. Usa db.getChat(msg.chat) para obtener la base de datos y db.updateChat(msg.chat, 'clave', valor) para guardar.
5. El código debe ir dentro de un bloque de markdown \`\`\`javascript ... \`\`\` y luego una breve explicación.

Consulta del usuario: ${consulta}`;

      const urlAPI = `https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(promptSistema)}`;

      console.log(`🌐 [CODIGO] Consultando API...`);
      
      const res = await fetch(urlAPI, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const textoRespuesta = await res.text();

      if (textoRespuesta.startsWith('<!DOCTYPE') || textoRespuesta.startsWith('<html')) {
        console.log('⚠️ [CODIGO] La API devolvió HTML');
        return msg.reply('❌ La IA no está disponible en este momento.');
      }

      let json;
      try {
        json = JSON.parse(textoRespuesta);
      } catch (e) {
        console.error('⚠️ [CODIGO] Error parseando JSON:', textoRespuesta.slice(0, 200));
        return msg.reply('❌ La IA devolvió una respuesta inválida.');
      }

      const respuestaIA = json.result || json.response || json.answer || json.data || json.message;

      if (!respuestaIA) {
        return msg.reply('❌ La IA no devolvió una respuesta.');
      }

      console.log(`✅ [CODIGO] Respuesta generada. Enviando...`);

      await sock.sendMessage(msg.chat, {
        text: `💻 *Asistente de Código*\n\n${respuestaIA}`
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [CODIGO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al generar el código.');
    }
  }
};
