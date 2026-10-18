import db from "#db"
import fs from 'fs'

export function iniciarReglasChecker(sock) {
  console.log('📜 [REGLAS CHECKER] Sistema de reglas iniciado.');

  setInterval(async () => {
    try {
      const ahora = new Date();
      const todosLosChats = await db.getChat();

      for (const chatData of todosLosChats) {
        const reglasProgramadas = chatData.reglasConfig || [];
        if (reglasProgramadas.length === 0) continue;

        let huboCambios = false;
        const reglasRestantes = [];

        for (const config of reglasProgramadas) {
          if (!config.activas) continue;

          const horaProgramada = new Date(config.horaUTC);
          const diff = (horaProgramada - ahora) / 1000 / 60;

          // Si ya pasó la hora, se envía
          if (diff <= 0 && diff > -2) {
            console.log(`📜 [REGLAS CHECKER] Enviando reglas a ${chatData.id}`);

            try {
              // ✅ LEEMOS EL ARCHIVO DESDE EL DISCO DURO
              if (config.media && config.media.path) {
                if (!fs.existsSync(config.media.path)) {
                  console.error(`❌ [REGLAS] El archivo ya no existe: ${config.media.path}`);
                } else {
                  // Leemos el archivo como Buffer
                  const bufferMedia = fs.readFileSync(config.media.path);

                  if (config.media.type === 'image') {
                    await sock.sendMessage(chatData.id, { 
                      image: bufferMedia, 
                      caption: config.texto || '' 
                    });
                  } else {
                    await sock.sendMessage(chatData.id, { 
                      video: bufferMedia, 
                      caption: config.texto || '' 
                    });
                  }
                }
              } else if (config.texto) {
                // Solo texto
                await sock.sendMessage(chatData.id, { 
                  text: `📜 *REGLAS DEL GRUPO*\n\n${config.texto}\n\n> 💡 Por favor, respetar las reglas.` 
                });
              }
              console.log(`✅ [REGLAS] Enviadas correctamente.`);
            } catch (err) {
              console.error(`❌ Error enviando reglas:`, err.message);
            }

            // Reprogramamos para mañana
            const proximaHora = new Date(horaProgramada);
            proximaHora.setDate(proximaHora.getDate() + 1);
            config.horaUTC = proximaHora.toISOString();
            
            reglasRestantes.push(config);
          } else if (diff > 0) {
            // Aún no es la hora
            reglasRestantes.push(config);
          }
        }

        if (huboCambios || reglasRestantes.length !== reglasProgramadas.length) {
          await db.updateChat(chatData.id, 'reglasConfig', reglasRestantes);
        }
      }
    } catch (e) {
      console.error('❌ [REGLAS CHECKER ERROR]:', e.message);
    }
  }, 60 * 1000);
}
