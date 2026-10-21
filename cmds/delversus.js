import db from "#db"

export default {
  command: ['delversus', 'resetversus', 'limpiarversus', 'borrarversus'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(delversus|resetversus|limpiarversus|borrarversus)\s*/i, '')
        .trim()
        .toLowerCase();

      if (!texto) {
        return msg.reply(`🗑️ *Eliminar listas de Versus*

*📋 Opciones:*
> \`.delversus hoy\` → Borra la lista del día de hoy.
> \`.delversus all\` → Borra TODAS las listas de versus (historial completo).

> ⚠️ *Nota:* Esto solo borra la lista visual de versus. **NO** resta los corazones del \`.parti\` ni los versus jugados del \`.perfil\`.`);
      }

      const chatData = await db.getChat(msg.chat);
      
      // ✅ OPCIÓN 1: BORRAR SOLO EL DÍA DE HOY
      if (texto === 'hoy' || texto === 'dia' || texto === 'today') {
        // Calculamos la fecha de hoy en la zona del servidor (o forzamos una)
        const ahora = new Date();
        const dia = ahora.getDate().toString().padStart(2, '0');
        const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
        const fechaFormateada = `${dia}-${mes}`;
        
        const dbKeyVs = `versus_hoy_${fechaFormateada}`;
        
        // Verificamos si hay algo que borrar
        const versusHoy = chatData[dbKeyVs] || [];
        if (versusHoy.length === 0) {
          return msg.reply(`⚠️ No hay versus registrados para el día de hoy (${fechaFormateada}).`);
        }

        // Lo borramos (lo seteamos como un array vacío)
        await db.updateChat(msg.chat, dbKeyVs, []);

        return msg.reply(`✅ *Lista de versus de hoy eliminada*\n\n> Se borraron *${versusHoy.length}* versus registrados hoy (${fechaFormateada}).`);
      }

      // ✅ OPCIÓN 2: BORRAR TODO EL HISTORIAL
      if (texto === 'all' || texto === 'todo' || texto === 'historial') {
        let borrados = 0;
        
        // Recorremos todas las claves del chat buscando las de versus
        for (const key of Object.keys(chatData)) {
          if (key.startsWith('versus_hoy_')) {
            await db.updateChat(msg.chat, key, []);
            borrados++;
          }
        }

        if (borrados === 0) {
          return msg.reply('⚠️ No hay ningún versus en el historial.');
        }

        return msg.reply(`✅ *Historial de versus eliminado*\n\n> Se borraron las listas de *${borrados}* días diferentes.`);
      }

      return msg.reply('❌ Opción no válida.\n\n*Usa:* `.delversus hoy` o `.delversus all`');

    } catch (e) {
      console.error("❌ [DELVERSUS ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al intentar eliminar los versus.');
    }
  },
};
