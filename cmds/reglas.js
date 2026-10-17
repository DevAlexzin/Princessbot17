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

      const tieneImagen = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      const tieneVideo = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
      const tieneMedia = tieneImagen || tieneVideo;

      const zonas = {
        arg: { nombre: 'Argentina', tz: 'America/Argentina/Buenos_Aires', emoji: '🇦🇷' },
        peru: { nombre: 'Perú', tz: 'America/Lima', emoji: '🇵🇪' },
        col: { nombre: 'Colombia', tz: 'America/Bogota', emoji: '🇨🇴' },
        mex: { nombre: 'México', tz: 'America/Mexico_City', emoji: '🇲🇽' },
        chile: { nombre: 'Chile', tz: 'America/Santiago', emoji: '🇨🇱' },
        esp: { nombre: 'España', tz: 'Europe/Madrid', emoji: '🇪🇸' },
        ven: { nombre: 'Venezuela', tz: 'America/Caracas', emoji: '🇻🇪' },
        ecu: { nombre: 'Ecuador', tz: 'America/Guayaquil', emoji: '🇪🇨' },
        bol: { nombre: 'Bolivia', tz: 'America/La_Paz', emoji: '🇧🇴' },
        par: { nombre: 'Paraguay', tz: 'America/Asuncion', emoji: '🇵🇾' },
        uru: { nombre: 'Uruguay', tz: 'America/Montevideo', emoji: '🇺🇾' },
        bra: { nombre: 'Brasil', tz: 'America/Sao_Paulo', emoji: '🇧🇷' }
      };

      if (!texto && !tieneMedia) {
        return msg.reply(`📜 *Configurar Reglas Automáticas*

*📋 Formatos:*
\`.reglas hora zona | texto\` (solo texto)
> Responde a imagen: \`.reglas hora zona\`
> Responde a imagen: \`.reglas hora zona | texto\`

*📌 Ejemplos:*
\`.reglas 00 arg | 📜 REGLAS\\n1. Respetar\`
\`.reglas 20:30 peru | Reglas del grupo\`

*🌎 Zonas:* \`arg\` \`peru\` \`col\` \`mex\` \`chile\` \`esp\` \`ven\` \`ecu\` \`bol\` \`par\` \`uru\` \`bra\`

*🎯 Extra:*
\`.reglas ver\` → Ver reglas actuales
\`.reglas off\` → Desactivar`);
      }

      if (texto.toLowerCase() === 'ver' || texto.toLowerCase() === 'info') {
        const chatData = await db.getChat(msg.chat);
        const config = chatData.reglasConfig;
        if (!config) return msg.reply('⚠️ No hay reglas configuradas.');

        let info = `📜 *Reglas configuradas*\n\n`;
        info += `> ⏰ Hora: ${config.horaLocal} ${config.zonaEmoji || ''}\n`;
        info += `> 🌎 Zona: ${config.zonaNombre || 'N/A'}\n`;
        info += `> 📊 Estado: ${config.activas ? '✅ Activas' : '❌ Desactivadas'}\n`;
        info += `> 🖼️ Media: ${config.media ? (config.media.type === 'image' ? 'Imagen' : 'Video') : 'Sin media'}`;

        if (config.texto) info += `\n\n*Texto:*\n${config.texto}`;
        return msg.reply(info);
      }

      if (texto.toLowerCase() === 'off' || texto.toLowerCase() === 'desactivar') {
        await db.updateChat(msg.chat, 'reglasActivas', false);
        const chatData = await db.getChat(msg.chat);
        if (chatData.reglasConfig) {
          chatData.reglasConfig.activas = false;
          await db.updateChat(msg.chat, 'reglasConfig', chatData.reglasConfig);
        }
        return msg.reply('❌ *Reglas automáticas desactivadas*');
      }

      const partes = texto.split('|').map(p => p.trim());
      let horaTexto = partes[0];
      let reglasTexto = partes.slice(1).join('|').trim();

      if (!horaTexto) {
        return msg.reply('❌ Debes especificar la hora y zona.\n\n*Ejemplo:* `.reglas 00 arg | Reglas...`');
      }

      const horaMatch = horaTexto.match(/(\d{1,2})(?::(\d{2}))?/);
      if (!horaMatch) {
        return msg.reply('❌ Hora no válida.\n\n*Formato:* `HH:MM` o `HH` (ej: `00`, `20:30`)');
      }

      const horas = parseInt(horaMatch[1]);
      const minutos = horaMatch[2] ? parseInt(horaMatch[2]) : 0;

      if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
        return msg.reply('❌ Hora no válida. Debe estar entre 00:00 y 23:59.');
      }

      // ✅ Detectar zona horaria
      let zonaDetectada = null;
      const palabras = horaTexto.toLowerCase().split(/\s+/);

      for (const palabra of palabras) {
        const zonaLimpia = palabra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (zonas[zonaLimpia]) {
          zonaDetectada = zonas[zonaLimpia];
          break;
        }
      }

      if (!zonaDetectada) {
        return msg.reply(`❌ No se detectó zona horaria.\n\n*Zonas:* ${Object.keys(zonas).join(', ')}\n\n*Ejemplo:* \`.reglas 00 arg | Reglas...\``);
      }

      const reglasFinales = reglasTexto.replace(/\\n/g, '\n').trim();

      // ✅ Guardamos la media si existe
      let mediaGuardada = null;

      if (tieneImagen) {
        const imgMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        mediaGuardada = { type: 'image', rawMessage: imgMsg };
      } else if (tieneVideo) {
        const vidMsg = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        mediaGuardada = { type: 'video', rawMessage: vidMsg };
      }

      // ✅ CONVERTIMOS LA HORA LOCAL A UTC (igual que .compe)
      const ahora = new Date();
      
      // Obtenemos la fecha actual en la zona horaria
      const fechaActualZona = new Date(
        ahora.toLocaleString('en-US', { timeZone: zonaDetectada.tz })
      );

      // Creamos la fecha con la hora especificada
      const reglasFechaLocal = new Date(fechaActualZona);
      reglasFechaLocal.setHours(horas, minutos, 0, 0);

      // Si ya pasó la hora hoy, programamos para mañana
      if (reglasFechaLocal <= fechaActualZona) {
        reglasFechaLocal.setDate(reglasFechaLocal.getDate() + 1);
      }

      // Convertimos a UTC
      const fechaUTC = new Date(
        reglasFechaLocal.toLocaleString('en-US', { timeZone: 'UTC' })
      );
      const fechaZona = new Date(
        reglasFechaLocal.toLocaleString('en-US', { timeZone: zonaDetectada.tz })
      );
      const offset = fechaZona.getTime() - fechaUTC.getTime();
      const reglasUTC = new Date(reglasFechaLocal.getTime() - offset);

      console.log(`✅ [REGLAS] Configurada: ${horas}:${minutos.toString().padStart(2, '0')} ${zonaDetectada.emoji} (${zonaDetectada.nombre})`);
      console.log(`   → UTC: ${reglasUTC.toISOString()}`);

      // ✅ Guardamos con la hora UTC
      await db.updateChat(msg.chat, 'reglasConfig', {
        horaUTC: reglasUTC.toISOString(),        // ✅ Hora en UTC
        horaLocal: `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
        zona: zonaDetectada.tz,
        zonaNombre: zonaDetectada.nombre,
        zonaEmoji: zonaDetectada.emoji,
        texto: reglasFinales,
        media: mediaGuardada,
        activas: true,
        chatId: msg.chat,
        creadoPor: msg.sender.split('@')[0],
        fechaCreacion: new Date().toISOString()
      });

      let confirmMsg = `✅ *Reglas configuradas*\n\n`;
      confirmMsg += `> ⏰ Hora: *${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}* ${zonaDetectada.emoji} (${zonaDetectada.nombre})\n`;
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
