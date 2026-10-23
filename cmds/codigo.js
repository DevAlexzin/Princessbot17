import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['codigo', 'code', 'programar'],
  category: 'ia',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      let textoCompleto = msg.text || msg.body || '';
      const consulta = textoCompleto
        .replace(/^[.\/!#]?(codigo|code|programar)\s*/i, '')
        .trim();

      if (!consulta) {
        return msg.reply(`💻 *Ayuda de Programación*

*📋 Uso:* \`.codigo tarea\`

*📌 Ejemplos:*
> \`.codigo comando para dar advertencias\`
> \`.codigo comando para stickers\`

> 💡 *Nota:* La IA generará el código con la estructura de tu bot.`);
      }

      console.log(`💻 [CODIGO] Consulta: ${consulta}`);
      console.log(`🌐 [CODIGO] Consultando API...`);

      // ✅ PROMPT OPTIMIZADO (Más corto para que la API no falle)
      const prompt = `Eres un programador experto en Node.js y Baileys.
Crea un comando para un bot de WhatsApp usando EXACTAMENTE esta plantilla:

import db from "#db"

export default {
  command: ['nombre'],
  category: 'grupo',
  isAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      // usa msg.reply() para responder
      // usa sock.sendMessage(msg.chat, { text: "" }, { quoted: msg }) para enviar
    } catch (e) { msg.reply('Error'); }
  }
}

Reglas:
1. No uses "conn" ni "m". Usa "msg" y "sock".
2. Para guardar datos usa db.updateChat(msg.chat, 'clave', valor).
3. Devuelve solo el código en un bloque markdown y una breve explicación.

Tarea: ${consulta}`;

      const urlAPI = `https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(prompt)}`;
      
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

      // ✅ Buscamos la respuesta en cualquier campo posible
      let respuestaIA = json.result || json.response || json.answer || json.data || json.message || json.text;

      // ✅ Si la API devuelve un error interno
      if (!respuestaIA || respuestaIA.toLowerCase().includes('no response') || respuestaIA.toLowerCase().includes('error')) {
         console.log('⚠️ [CODIGO] La API no generó respuesta. Intentando de nuevo...');
         
         // Hacemos un segundo intento con un prompt más simple
         const promptSimple = `Escribe un comando de Baileys en Node.js para: ${consulta}. Usa export default { command: [], run: async ({ msg, sock }) => { ... } }`;
         const res2 = await fetch(`https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(promptSimple)}`);
         const json2 = await res2.json();
         respuestaIA = json2.result || json2.response || json2.message;
         
         if (!respuestaIA) {
           return msg.reply('❌ La IA está saturada y no pudo generar el código. Intenta de nuevo en unos minutos.');
         }
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
