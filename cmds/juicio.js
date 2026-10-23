import db from "#db"

export default {
  command: ['juicio', 'juzgar'],
  category: 'fun',
  botAdmin: false,
  run: async ({ msg, sock, args, participants }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      // ✅ 1. Detectar al acusado (mención o el primero de los args)
      const menciones = msg.mentionedJid || [];
      if (menciones.length === 0) {
        return msg.reply('⚖️ Debes mencionar a alguien para iniciar el juicio.\n\n*Ejemplo:* `.juicio @usuario por ladrón`');
      }

      const acusadoId = menciones[0];
      const acusadoNombre = `@${acusadoId.split('@')[0]}`;

      // ✅ 2. Obtener el motivo (el resto de los args)
      // Si hay mención, el motivo es lo que sigue después de la mención
      let textoLimpio = (msg.text || msg.body || '').replace(/@\d{8,20}/g, '').replace(/^[.\/!#]?(juicio|juzgar)\s*/i, '').trim();
      
      const motivo = textoLimpio || 'no especificado';

      // ✅ 3. Elegir al azar Juez, Fiscal y Defensor (excluyendo al acusado y al bot)
      const botId = sock.user.id;
      const candidatos = participants.filter(p => p.id !== botId && p.id !== acusadoId);

      if (candidatos.length < 3) {
        return msg.reply('❌ Se necesitan al menos 3 personas más en el grupo (aparte del acusado) para el juicio.');
      }

      // Mezclamos y elegimos 3
      const rolesMezclados = candidatos.sort(() => 0.5 - Math.random());
      const juez = rolesMezclados[0].id;
      const fiscal = rolesMezclados[1].id;
      const defensor = rolesMezclados[2].id;

      const nombreJuez = `@${juez.split('@')[0]}`;
      const nombreFiscal = `@${fiscal.split('@')[0]}`;
      const nombreDefensor = `@${defensor.split('@')[0]}`;

      console.log(`⚖️ [JUICIO] Acusado: ${acusadoNombre} | Motivo: ${motivo}`);

      // ✅ 4. Enviar el mensaje del juicio
      const mensajeJuicio = `⚖️ *¡JUICIO EXPRESS EN EL GRUPO!* ⚖️

👤 *Acusado:* ${acusadoNombre}
📜 *Motivo:* ${motivo}

👨‍⚖️ *Juez:* ${nombreJuez}
🗣️ *Fiscal:* ${nombreFiscal}
🛡️ *Defensor:* ${nombreDefensor}

> ⏳ *El jurado (el grupo) tiene 2 minutos para votar.*
> 🗳️ *Voten en la encuesta de abajo:*`;

      await sock.sendMessage(msg.chat, {
        text: mensajeJuicio,
        mentions: [acusadoId, juez, fiscal, defensor]
      }, { quoted: msg });

      // ✅ 5. Enviar la encuesta
      await sock.sendMessage(msg.chat, {
        poll: {
          name: '⚖️ Veredicto del Juicio',
          values: ['🔴 Culpable', '🟢 Inocente'],
          selectableCount: 1
        }
      });

      // ✅ 6. (Opcional) Esperar 2 minutos y anunciar los resultados
      // Si el bot es admin, podríamos mutear al acusado si gana "Culpable"
      // Pero eso lo dejamos para otro comando o lo hacemos manual.

    } catch (e) {
      console.error("❌ [JUICIO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al iniciar el juicio.');
    }
  }
};
