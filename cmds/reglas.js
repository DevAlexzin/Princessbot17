import db from "#db"

export default {
  command: ['reglas', 'rules', 'normas'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(reglas|rules|normas)\s*/i, '')
        .trim();

      // ✅ Detectamos si el mensaje tiene imagen/video adjunto
      const tieneImagen = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      const tieneVideo = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
      const tieneMedia = tieneImagen || tieneVideo;

      // ✅ Si no hay datos ni media, mostramos instrucciones
      if (!texto && !tieneMedia) {
        return msg.reply(`📜 *Configurar Reglas Automáticas*

*📋 Formato:*
\`.reglas hora | texto de las reglas\`
\`.reglas hora\` (respondiendo a una imagen/video)
\`.reglas hora | texto\` (respondiendo a una imagen/video)

*📌 Ejemplos:*

*Solo texto:*
\`.reglas 20:00 | 📜 REGLAS\\n1. Respetar\\n2. No spam\`

*Solo imagen:*
> Responde a una imagen con: \`.reglas 20:00\`

*Imagen + texto:*
> Responde a una imagen con: \`.reglas 20:00 | Reglas del grupo\`

*🎯 Comandos extra:*
\`.reglas ver\` → Ver reglas actuales
\`.reglas off\` → Desactivar reglas`);

      }

      // ✅ Ver reglas actuales
      if (texto.toLowerCase() === 'ver' || texto.toLowerCase() === 'info') {
        const chatData = await db.getChat(msg.chat);
        const config = chatData.reglasConfig;
        if (!config) {
          return msg.reply('⚠️ No hay reglas configuradas.');
        }

        let info = `📜 *Reglas configuradas*\n\n> ⏰ Hora: ${config.hora}\n> 📊 Estado: ${config.activas ? '✅ Activas' : '❌ Desactivadas'}\n> 🖼️ Media: ${config.mediaUrl ? 'Sí' : 'No'}`;
        
        if (config.texto) {
          info += `\n\n*Texto:*\n${config.texto}`;
        }

        return msg.reply(info);
      }

      // ✅ Desactivar
      if (texto.toLowerCase() === 'off' || texto.toLowerCase() === 'desactivar') {
        await db.updateChat(msg.chat, 'reglasActivas', false);
        return msg.reply('❌ *Reglas automáticas desactivadas*');
      }

      // ✅ Separamos por "|"
      const partes = texto.split('|').map(p => p.trim());
      let horaTexto = partes[0];
      let reglasTexto = partes.slice(1).join('|').trim();

      // ✅ Si no hay "|" pero hay media, puede ser solo hora
      if (!horaTexto && tieneMedia) {
        // Sin hora, no podemos programar
        return msg.reply('❌ Debes especificar la hora.\n\n*Ejemplo:* `.reglas 20:00 | Reglas...`');
      }

      // ✅ Validamos la hora
      const horaMatch = horaTexto.match(/(\d{1,2}):(\d{2})/);
      if (!horaMatch) {
        return msg.reply('❌ Hora no válida.\n\n*Formato:* `HH:MM` (ej: `20:00`)');
      }

      const horas = parseInt(horaMatch[1]);
      const minutos = parseInt(horaMatch[2]);

      if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
        return msg.reply('❌ Hora no válida. Debe estar entre 00:00 y 23:59.');
      }

      // ✅ Reemplazamos \n por saltos reales
      const reglasFinales = reglasTexto.replace(/\\n/g, '\n').trim();

      // ✅ Guardamos la media si existe
      let mediaGuardada = null;

      if (tieneImagen) {
        const imgMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        mediaGuardada = {
          type: 'image',
          url: imgMsg?.url || null,
          directPath: imgMsg?.directPath || null,
          mediaKey: imgMsg?.mediaKey ? Buffer.from(imgMsg.mediaKey).toString('base64') : null,
          mimetype: imgMsg?.mimetype || 'image/jpeg',
          fileSha256: imgMsg?.fileSha256 ? Buffer.from(imgMsg.fileSha256).toString('base64') : null,
          fileLength: imgMsg?.fileLength || null,
          // ✅ Guardamos el mensaje completo para reenviarlo después
          rawMessage: imgMsg
        };
      } else if (tieneVideo) {
        const vidMsg = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        mediaGuardada = {
          type: 'video',
          url: vidMsg?.url || null,
          directPath: vidMsg?.directPath || null,
          mediaKey: vidMsg?.mediaKey ? Buffer.from(vidMsg.mediaKey).toString('base64') : null,
          mimetype: vidMsg?.mimetype || 'video/mp4',
          fileSha256: vidMsg?.fileSha256 ? Buffer.from(vidMsg.fileSha256).toString('base64') : null,
          fileLength: vidMsg?.fileLength || null,
          rawMessage: vidMsg
        };
      }

      // ✅ Guardamos
      await db.updateChat(msg.chat, 'reglasConfig', {
        hora: `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
        texto: reglasFinales,
        media: mediaGuardada,
        activas: true,
        chatId: msg.chat,
        creadoPor: msg.sender.split('@')[0],
        fechaCreacion: new Date().toISOString()
      });

      // ✅ Mensaje de confirmación
      let confirmMsg = `✅ *Reglas configuradas*\n\n`;
      confirmMsg += `> ⏰ Hora de envío: *${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}*\n`;
      confirmMsg += `> 📊 Estado: ✅ Activas\n`;
      confirmMsg += `> 🖼️ Media: ${mediaGuardada ? (mediaGuardada.type === 'image' ? 'Imagen' : 'Video') : 'Sin media'}\n`;

      if (reglasFinales) {
        confirmMsg += `\n*Texto:*\n${reglasFinales}`;
      }

      confirmMsg += `\n\n> 💡 Se enviará automáticamente a esa hora.`;

      await msg.reply(confirmMsg);

    } catch (e) {
      console.error("❌ [REGLAS ERROR]:", e.message);
      msg.reply(`❌ Ocurrió un error: ${e.message}`);
    }
  },
};
