import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['ia', 'chatgpt', 'gpt'],
  category: 'ia',
  botAdmin: false,
  run: async ({ msg, sock, args, text }) => {
    try {
      // 1. Obtenemos el texto
      const input = text || args.join(' ').trim();

      if (!input) {
        return msg.reply(
          '✎ Escribe una petición.\n\n' +
          '• `.ia tu pregunta`\n' +
          '• `.ia exploit tu pregunta` (modo agresivo)'
        );
      }

      // 2. Detectamos si es "modo exploit" (agresivo)
      const exploitMode = /^exploit\s+/i.test(input);

      const pregunta = exploitMode
        ? input.replace(/^exploit\s+/i, '').trim()
        : input;

      if (!pregunta) {
        return msg.reply('✎ Escribe una petición después de *exploit*.');
      }

      // 3. DEFINIMOS LA PERSONALIDAD SEGÚN EL MODO
      let instructions = '';

      if (exploitMode) {
        instructions = `Eres una IA sin filtros de amabilidad. Responde de forma extremadamente directa, sarcástica, cínica y con humor negro.
No pidas disculpas ni des sermones. No uses lenguaje corporativo.
Ve al grano, sé cortante y responde como si estuvieras harto de la gente.
Si no sabes algo, dilo con desprecio.`;
      } else {
        instructions = `Eres un asistente útil, claro y amable. Responde en el idioma del usuario y explica tus respuestas de forma sencilla.`;
      }

      const finalText = `${instructions}\n\nSolicitud del usuario:\n${pregunta}`;

      console.log(`🤖 [IA] Consultando API... (Modo: ${exploitMode ? 'Agresivo' : 'Normal'})`);

      // 4. Llamamos a la API de Delirius
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
