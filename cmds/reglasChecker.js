import db from "#db"

export function iniciarReglasChecker(sock) {
  console.log('📜 [REGLAS CHECKER] Sistema de reglas iniciado.');

  setInterval(async () => {
    try {
      const ahora = new Date();
      const horaActual = `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

      const todosLosChats = await db.getChat();

      for (const chatData of todosLosChats) {
        if (!chatData || !chatData.reglasConfig) continue;

        const config = chatData.reglasConfig;

        if (!config.activas) continue;
        if (config.hora !== horaActual) continue;

        // ✅ Evitamos enviar dos veces el mismo minuto
        const ultimoEnvio = config.ultimoEnvio ? new Date(config.ultimoEnvio) : null;
        if (ultimoEnvio) {
          const diffMin = (ahora - ultimoEnvio) / 1000 / 60;
          if (diffMin < 1) continue;
        }

        console.log(`📤 [REGLAS] Enviando reglas a ${chatData.id}`);

        try {
          // ✅ CASO 1: Con media (imagen o video)
          if (config.media && config.media.rawMessage) {
            const media = config.media;

            if (media.type === 'image') {
              await sock.sendMessage(chatData.id, {
                image: media.rawMessage,
                caption: config.texto || ''
              });
            } else if (media.type === 'video') {
              await sock.sendMessage(chatData.id, {
                video: media.rawMessage,
                caption: config.texto || ''
              });
            }
          }
          // ✅ CASO 2: Solo texto
          else if (config.texto) {
            await sock.sendMessage(chatData.id, {
              text: `📜 *REGLAS DEL GRUPO*\n\n${config.texto}\n\n> 💡 Por favor, respetar las reglas.`
            });
          }

          // ✅ Actualizamos timestamp
          config.ultimoEnvio = ahora.toISOString();
          await db.updateChat(chatData.id, 'reglasConfig', config);

          console.log(`✅ [REGLAS] Reglas enviadas a ${chatData.id}`);

        } catch (err) {
          console.error(`❌ [REGLAS] Error enviando a ${chatData.id}:`, err.message);
        }
      }
    } catch (e) {
      console.error('❌ [REGLAS CHECKER ERROR]:', e.message);
    }
  }, 60 * 1000);
}
