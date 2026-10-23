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
> \`.codigo comando para stickers\``);
      }

      console.log(`💻 [CODIGO] Consulta: ${consulta}`);

      // ✅ Función para limpiar la respuesta
      const limpiarRespuesta = (texto) => {
        return texto.replace(/```javascript/g, '```js');
      };

      // ✅ PROMPT
      const prompt = `Escribe un comando para un bot de WhatsApp en Node.js (Baileys).
Usa esta estructura exacta:
import db from "#db"
export default {
  command: ['nombre'],
  run: async ({ msg, sock }) => {
     // Tu código aquí
  }
}
No uses 'conn' ni 'm'. Responde solo con el código en un bloque markdown.
Tarea: ${consulta}`;

      let respuestaIA = null;

      // ✅ INTENTO 1: API de Delirius
      try {
        console.log(`🌐 [CODIGO] Consultando API 1 (Delirius)...`);
        const urlAPI = `https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(prompt)}`;
        const res = await fetch(urlAPI, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const textoRespuesta = await res.text();
        
        if (!textoRespuesta.startsWith('<!DOCTYPE') && !textoRespuesta.startsWith('<html')) {
          const json = JSON.parse(textoRespuesta);
          respuestaIA = json.result || json.response || json.message;
        }
      } catch (e) {
        console.log('⚠️ [CODIGO] API 1 falló:', e.message);
      }

      // ✅ INTENTO 2: API de respaldo (Vreden)
      if (!respuestaIA || respuestaIA.toLowerCase().includes('no response')) {
        try {
          console.log(`🌐 [CODIGO] Consultando API 2 (Respaldo)...`);
          const urlAPI2 = `https://api.vreden.web.id/api/chatgpt?query=${encodeURIComponent(prompt)}`;
          const res2 = await fetch(urlAPI2, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const json2 = await res2.json();
          
          // Vreden devuelve la respuesta en result.response o result.message
          respuestaIA = json2.result?.response || json2.result?.message || json2.message;
        } catch (e) {
          console.log('⚠️ [CODIGO] API 2 falló:', e.message);
        }
      }

      // ✅ INTENTO 3: API de respaldo 2 (Fgsi)
      if (!respuestaIA || respuestaIA.toLowerCase().includes('no response')) {
        try {
          console.log(`🌐 [CODIGO] Consultando API 3 (Respaldo 2)...`);
          const urlAPI3 = `https://api-fgsi.vercel.app/api/ai/gpt?q=${encodeURIComponent(prompt)}`;
          const res3 = await fetch(urlAPI3, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          const json3 = await res3.json();
          
          respuestaIA = json3.result || json3.message;
        } catch (e) {
          console.log('⚠️ [CODIGO] API 3 falló:', e.message);
        }
      }

      // ✅ Si todas las APIs fallan
      if (!respuestaIA) {
        return msg.reply('❌ Todas las APIs de IA están caídas en este momento. Intenta de nuevo más tarde.');
      }

      console.log(`✅ [CODIGO] Respuesta generada con éxito.`);
      
      await sock.sendMessage(msg.chat, {
        text: `💻 *Asistente de Código*\n\n${limpiarRespuesta(respuestaIA)}`
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [CODIGO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al generar el código.');
    }
  }
};
