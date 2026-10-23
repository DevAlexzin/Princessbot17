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

> 💡 *Nota:* El bot usará IA para generar el código.`);
      }

      console.log(`💻 [CODIGO] Consulta: ${consulta}`);

      // ✅ Prompt optimizado (más corto y directo)
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

      const urlAPI = `https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(prompt)}`;
      
      console.log(`🌐 [CODIGO] Consultando API...`);
      const res = await fetch(urlAPI, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const textoRespuesta = await res.text();
      let json = JSON.parse(textoRespuesta);
      let respuestaIA = json.result || json.response || json.message;

      // ✅ Si falla la primera vez, intentamos con un prompt aún más simple
      if (!respuestaIA || respuestaIA.toLowerCase().includes('no response')) {
        console.log('⚠️ [CODIGO] Falló intento 1. Reintentando con prompt simple...');
        
        const promptSimple = `Escribe código JavaScript puro para: ${consulta}`;
        const res2 = await fetch(`https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(promptSimple)}`);
        const json2 = await res2.json();
        respuestaIA = json2.result || json2.response || json2.message;
      }

      // ✅ Si sigue fallando, usamos la API de respaldo (otra IA)
      if (!respuestaIA || respuestaIA.toLowerCase().includes('no response')) {
        console.log('⚠️ [CODIGO] Falló intento 2. Usando API de respaldo...');
        try {
          const res3 = await fetch(`https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(consulta)}`);
          const json3 = await res3.json();
          respuestaIA = json3.result || json3.response || json3.message;
        } catch (e) {
          console.error('❌ Error en API de respaldo:', e.message);
        }
      }

      if (!respuestaIA) {
        return msg.reply('❌ La IA está muy saturada en este momento. Intenta de nuevo en unos minutos o usa un comando más corto.');
      }

      // Limpiamos la respuesta para que no se vea fea
      respuestaIA = respuestaIA.replace(/```javascript/g, '```js');

      console.log(`✅ [CODIGO] Respuesta generada. Enviando...`);

      await sock.sendMessage(msg.chat, {
        text: `💻 *Asistente de Código*\n\n${respuestaIA}`
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [CODIGO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al generar el código. La API puede estar caída.');
    }
  }
};
