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

      // 1. Extraemos el texto del mensaje
      let textoCompleto = msg.text || msg.body || '';
      const consulta = textoCompleto
        .replace(/^[.\/!#]?(codigo|code|programar)\s*/i, '')
        .trim();

      if (!consulta) {
        return msg.reply(`💻 *Ayuda de Programación*

*📋 Uso:* \`.codigo lenguaje tarea\`

*📌 Ejemplos:*
> \`.codigo js hola mundo\`
> \`.codigo python calculadora\`
> \`.codigo html pagina web\`
> \`.codigo error TypeError\`
> \`.codigo regex correo\`

> 💡 *Nota:* El bot usará IA para generar el código.`);
      }

      console.log(`💻 [CODIGO] Consulta: ${consulta}`);

      // 2. Preparamos el Prompt para la IA
      const promptSistema = `Eres un asistente experto en programación.
El usuario te pedirá ayuda con código. Debes responder SIEMPRE con un bloque de código formateado y una breve explicación.
Usa el formato de markdown para el código. Si el usuario pide un error, explica qué significa y cómo solucionarlo.
Sé claro, conciso y directo. No inventes cosas que no sepas.

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
        return msg.reply('❌ La IA no está disponible en este momento. Intenta más tarde.');
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
        console.log('⚠️ [CODIGO] Respuesta vacía de la API.');
        return msg.reply('❌ La IA no devolvió una respuesta.');
      }

      // 3. Enviamos la respuesta de la IA al chat
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
