import db from "#db"

export function iniciarReglasChecker(sock) {
  console.log('📜 [REGLAS CHECKER] Sistema de reglas iniciado.');

  setInterval(async () => {
    try {
      const ahora = new Date();
      const todosLosChats = await db.getChat();

      for (const chatData of todosLosChats) {
        if (!chatData || !chatData.reglasConfig) continue;

        const config = chatData.reglasConfig;
        if (!config.activas) continue;

        // ✅ Si tiene horaUTC, comparamos como compe
        if (config.horaUTC) {
          const horaProgramada = new Date(config.horaUTC);
          const diffMin = (horaProgramada - ahora) / 1000 / 60;

          // ✅ Si ya pasó la hora por más de 1 minuto, no enviamos
          // Pero si es la hora exacta (dentro del minuto), enviamos
          if (diffMin > 1 || diffMin < -1) continue;

          // ✅ Evitamos enviar dos veces el mismo minuto
          const ultimoEnvio = config.ultimoEnvio ? new Date(config.ultimoEnvio) : null;
          if (ultimoEnvio) {
            const diffUltimo = (ahora - ultimoEnvio) / 1000 / 60;
            if (diffUltimo < 1) continue;
          }

          console.log(`========================================`);
          console.log(`📜 [REGLAS CHECKER] ¡HORA DETECTADA!`);
          console.log(`⏰ Hora: ${config.horaLocal} ${config.zonaEmoji || ''} (${config.zonaNombre || ''})`);
          console.log(`📌 Chat: ${chatData.id}`);
          console.log(`========================================`);

          try {
            // ✅ CASO 1: Con media
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

            console.log(`✅ [REGLAS] Reglas enviadas a ${chatData.id}`);

            // ✅ Re-programamos para el día siguiente (sumamos 24 horas)
            const proximaHora = new Date(horaProgramada);
            proximaHora.setDate(proximaHora.getDate() + 1);

            config.horaUTC = proximaHora.toISOString();
            config.ultimoEnvio = ahora.toISOString();
            await db.updateChat(chatData.id, 'reglasConfig', config);

            console.log(`🔄 [REGLAS] Próximo envío: ${proximaHora.toISOString()}`);

          } catch (err) {
            console.error(`❌ [REGLAS] Error enviando a ${chatData.id}:`, err.message);
          }
        }
      }
    } catch (e) {
      console.error('❌ [REGLAS CHECKER ERROR]:', e.message);
    }
  }, 60 * 1000);
}
