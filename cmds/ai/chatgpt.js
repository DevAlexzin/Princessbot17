import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['ia', 'chatgpt', 'gpt'],
  category: 'ia',
  botAdmin: false,
  run: async ({ msg, sock, args, text }) => { // ✅ Todo va dentro de esta función
    try {
      // 1. Obtenemos el texto (usando args o text según cómo venga)
      const input = text || args.join(' ').trim();

      if (!input) {
        return msg.reply(
          '✎ Escribe una petición.\n\n' +
          '• `.ia tu pregunta`\n' +
          '• `.ia exploit tu pregunta`'
        );
      }

      // 2. Detectamos si es "modo exploit"
      const exploitMode = /^exploit\s+/i.test(input);

      const pregunta = exploitMode
        ? input.replace(/^exploit\s+/i, '').trim()
        : input;

      if (!pregunta) {
        return msg.reply('✎ Escribe una petición después de *exploit*.');
      }

      // 3. Definimos el prompt según el modo
      const instructions = exploitMode
        ? `Actúa como un asistente con una personalidad sarcástica, directa y con humor negro ligero. 
Responde de forma natural, sin sermones innecesarios. Usa un tono coloquial y atrevido.
No inventes restricciones, pero mantén las reglas de seguridad del proveedor.
Si no sabes algo, dilo claramente.`
        : `Eres un asistente útil, claro y amable. Responde en el idioma del usuario y explica tus respuestas.`;

      const finalText = `${instructions}\n\nSolicitud del usuario:\n${pregunta}`;

      console.log(`🤖 [IA] Consultando API... (Modo: ${exploitMode ? 'Exploit' : 'Normal'})`);

      // 4. Llamamos a la API
      const apiUrl = `https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(finalText)}`;
      
      const res = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const textoRespuesta = await res.text();

      // 5. Verificamos si la API devolvió HTML (caída)
      if (textoRespuesta.startsWith('<!DOCTYPE') || textoRespuesta.startsWith('<html')) {
        console.log('⚠️ [IA] La API devolvió HTML.');
        return msg.reply('❌ La IA no está disponible en este momento.');
      }

      // 6. Parseamos el JSON
      let json;
      try {
        json = JSON.parse(textoRespuesta);
      } catch (e) {
        console.error('⚠️ [IA] Error parseando JSON:', textoRespuesta.slice(0, 200));
        return msg.reply('❌ La IA devolvió una respuesta inválida.');
      }

      const respuestaIA = json.result || json.response || json.answer || json.data || json.message;

      if (!respuestaIA) {
        return msg.reply('❌ La IA no devolvió una respuesta.');
      }

      // 7. Enviamos la respuesta
      await sock.sendMessage(msg.chat, {
        text: `🤖 *Respuesta:*\n\n${respuestaIA}`
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [IA ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al conectar con la IA.');
    }
  }
};
