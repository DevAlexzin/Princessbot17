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
          '• `.ia tu pregunta` (modo normal)\n' +
          '• `.ia exploit tu pregunta` (modo cínico y sarcástico)'
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

      // 3. DEFINIMOS LA PERSONALIDAD SEGÚN EL MODO
      let instructions = '';

      if (exploitMode) {
        // ✅ MODO CÍNICO / SARCÁSTICO (Pesado pero sin insultos directos)
        instructions = `Eres un asistente con una personalidad extremadamente cínica, sarcástica y con un humor negro muy pesado. 
Tratas al usuario con condescendencia y superioridad, como si fuera un idiota, pero usando ironía y sarcasmo en lugar de insultos directos.
No pidas disculpas, no des sermones y no seas amable.
Responde de forma cortante y burlona. Si el usuario dice algo absurdo, humíllalo intelectualmente de forma elegante pero hiriente.
Si no sabes algo, dilo con desprecio o burla.`;
      } else {
        // ✅ MODO NORMAL
        instructions = `Eres un asistente útil, claro y amable. Responde en el idioma del usuario y explica tus respuestas de forma sencilla.`;
      }

      const finalText = `${instructions}\n\nSolicitud del usuario:\n${pregunta}`;

      console.log(`🤖 [IA] Consultando API... (Modo: ${exploitMode ? 'Cínico' : 'Normal'})`);

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
