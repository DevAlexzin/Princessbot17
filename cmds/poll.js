import db from "#db"

export default {
  command: ['poll', 'encuesta', 'crearencuesta'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(poll|encuesta|crearencuesta)\s*/i, '')
        .trim();

      if (!texto) {
        return msg.reply(`📊 *Crear Encuesta*

*📋 Formato:*
\`.poll Pregunta | Opción 1 | Opción 2 | Opción 3\`

*📌 Ejemplo:*
\`.poll ¿Qué jugamos hoy? | Fútbol | Básquet | Videojuegos\`

> ⚠️ *Nota:* Separa la pregunta y cada opción con el símbolo \`|\` (barra vertical).`);
      }

      // ✅ Separamos el texto por el símbolo "|"
      const partes = texto.split('|').map(p => p.trim()).filter(p => p !== '');

      if (partes.length < 3) {
        return msg.reply('❌ *Faltan datos.*\n\nDebes poner al menos la pregunta y 2 opciones.\n\n*Ejemplo:* `.poll ¿Qué jugamos? | Fútbol | Básquet`');
      }

      // La primera parte es la pregunta, el resto son las opciones
      const pregunta = partes[0];
      const opciones = partes.slice(1);

      // ✅ Validación de límite (WhatsApp permite máximo 12 opciones en encuestas)
      if (opciones.length > 12) {
        return msg.reply('❌ *Demasiadas opciones.*\n\nWhatsApp permite un máximo de 12 opciones por encuesta.');
      }

      // ✅ Enviamos la encuesta
      await sock.sendMessage(msg.chat, {
        poll: {
          name: pregunta,
          values: opciones,
          selectableCount: 1 // Solo se puede votar por 1 opción
        }
      }, { quoted: msg });

      console.log(`✅ [POLL] Encuesta creada: "${pregunta}" con ${opciones.length} opciones.`);

    } catch (e) {
      console.error("❌ [POLL ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al crear la encuesta.');
    }
  },
};
