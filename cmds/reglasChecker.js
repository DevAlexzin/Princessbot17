import db from "#db"

export function iniciarReglasChecker(sock) {
  console.log('📜 [REGLAS CHECKER] Sistema de reglas iniciado.');

  setInterval(async () => {
    try {
      const ahora = new Date();
      const todosLosChats = await db.getChat();

      for (const chatData of todosLosChats) {
        // ✅ Leemos el ARRAY igual que compe
        const reglasProgramadas = chatData.reglasConfig || [];
        if (reglasProgramadas.length === 0) continue;

        let huboCambios = false;
        const reglasRestantes = [];

        for (const config of reglasProgramadas) {
          if (!config.activas) continue;

          const horaProgramada = new Date(config.horaUTC);
          const diff = (horaProgramada - ahora) / 1000 / 60; // Diferencia en minutos

          console.log(`🕐 [REGLAS DEBUG] Chat: ${chatData.id.substring(0,5)}... | Faltan: ${diff.toFixed(1)} min | Config: ${config.horaLocal}`);

          // ✅ Si ya pasó la hora por más de 2 minutos, lo eliminamos
          if (diff < -2) {
            huboCambios = true;
            continue; 
          }

          // ✅ Si faltan entre 0 y 1 minuto (es la hora exacta)
          if (diff <= 0 && diff > -1) {
            console.log(`========================================`);
            console.log(`📜 [REGLAS CHECKER] ¡HORA DETECTADA!`);
            console.log(`⏰ Hora: ${config.horaLocal} ${config.zonaEmoji}`);
            console.log(`========================================`);

            try {
              if (config.media && config.media.rawMessage) {
                if (config.media.type === 'image') {
                  await sock.sendMessage(chatData.id, { image: config.media.rawMessage, caption: config.texto || '' });
                } else {
                  await sock.sendMessage(chatData.id, { video: config.media.rawMessage, caption: config.texto || '' });
                }
              } else if (config.texto) {
                await sock.sendMessage(chatData.id, { text: `📜 *REGLAS DEL GRUPO*\n\n${config.texto}\n\n> 💡 Por favor, respetar las reglas.` });
              }
              console.log(`✅ [REGLAS] Enviadas a ${chatData.id}`);
            } catch (err) {
              console.error(`❌ Error enviando reglas:`, err.message);
            }

            // ✅ Al enviarlo, lo programamos para el día siguiente (+24 hrs)
            const proximaHora = new Date(horaProgramada);
            proximaHora.setDate(proximaHora.getDate() + 1);
            
            config.horaUTC = proximaHora.toISOString();
            reglasRestantes.push(config); // Lo mantenemos en la lista
          } else {
            // Si aún no es la hora, lo dejamos en la lista
            reglasRestantes.push(config);
          }
        }

        if (huboCambios) {
          await db.updateChat(chatData.id, 'reglasConfig', reglasRestantes);
        }
      }
    } catch (e) {
      console.error('❌ [REGLAS CHECKER ERROR]:', e.message);
    }
  }, 60 * 1000);
}
