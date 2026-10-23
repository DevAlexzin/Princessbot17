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
> \`.codigo comando para kick\`
> \`.codigo comando para stickers\``);
      }

      console.log(`💻 [CODIGO] Consulta: ${consulta}`);

      // ✅ PROMPT CORTO Y DIRECTO
      const prompt = `Actúa como programador de Baileys. Escribe un comando para WhatsApp usando esta estructura:
import db from "#db"
export default { command: ['nombre'], run: async ({ msg, sock }) => { /* código aquí */ } }
Usa msg.reply() y sock.sendMessage(). No uses 'conn' ni 'm'.
Tarea: ${consulta}`;

      console.log(`🌐 [CODIGO] Consultando API...`);
      
      // ✅ NUEVA API MÁS ESTABLE (Sin límite de caracteres estricto)
      const urlAPI = `https://api.agatz.xyz/api/chatgpt?message=${encodeURIComponent(prompt)}`;
      
      const res = await fetch(urlAPI, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const textoRespuesta = await res.text();

      // Verificamos que no sea HTML
      if (textoRespuesta.startsWith('<!DOCTYPE') || textoRespuesta.startsWith('<html')) {
        return msg.reply('❌ La API está caída. Intenta más tarde.');
      }

      let json;
      try {
        json = JSON.parse(textoRespuesta);
      } catch (e) {
        return msg.reply('❌ La API devolvió un error. Intenta de nuevo.');
      }

      // Buscamos la respuesta en los campos de la nueva API
      let respuestaIA = json.data?.response || json.data?.message || json.result || json.message;

      if (!respuestaIA) {
        console.log('⚠️ [CODIGO] Respuesta vacía:', JSON.stringify(json).slice(0, 200));
        return msg.reply('❌ La IA no devolvió una respuesta. Intenta de nuevo.');
      }

      // Limpiamos un poco el formato
      respuestaIA = respuestaIA.replace(/```javascript/g, '```js');

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
