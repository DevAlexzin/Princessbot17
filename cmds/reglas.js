import db from "#db"

export default {
  command: ['reglas', 'rules', 'normas'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto.replace(/^[.\/!#]?(reglas|rules|normas)\s*/i, '').trim();

      const tieneImagen = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      const tieneVideo = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
      const tieneMedia = tieneImagen || tieneVideo;

      const zonas = {
        arg: { nombre: 'Argentina', tz: 'America/Argentina/Buenos_Aires', emoji: '🇦🇷' },
        peru: { nombre: 'Perú', tz: 'America/Lima', emoji: '🇵🇪' },
        col: { nombre: 'Colombia', tz: 'America/Bogota', emoji: '🇨🇴' },
        mex: { nombre: 'México', tz: 'America/Mexico_City', emoji: '🇲🇽' },
        chile: { nombre: 'Chile', tz: 'America/Santiago', emoji: '🇨🇱' },
        esp: { nombre: 'España', tz: 'Europe/Madrid', emoji: '🇪🇸' }
      };

      if (!texto && !tieneMedia) {
        return msg.reply(`📜 *Configurar Reglas Automáticas*

*Formatos:*
\`.reglas hora zona | texto\` (solo texto)
> Responde a imagen: \`.reglas hora zona\`
> Responde a imagen: \`.reglas hora zona | texto\`

*Ejemplo:* \`.reglas 22:10 arg | 📜 REGLAS\\n1. Respetar\`
*Zonas:* \`arg\` \`peru\` \`col\` \`mex\` \`chile\` \`esp\`

*Extra:* \`.reglas ver\` | \`.reglas off\``);
      }

      if (texto.toLowerCase() === 'off' || texto.toLowerCase() === 'desactivar') {
        await db.updateChat(msg.chat, 'reglasConfig', []); // Guardamos array vacío
        return msg.reply('❌ *Reglas automáticas desactivadas*');
      }

      if (texto.toLowerCase() === 'ver' || texto.toLowerCase() === 'info') {
        const chatData = await db.getChat(msg.chat);
        const config = chatData.reglasConfig?.[0];
        if (!config) return msg.reply('⚠️ No hay reglas configuradas.');
        
        let info = `📜 *Reglas configuradas*\n\n> ⏰ Hora: ${config.horaLocal} ${config.zonaEmoji}\n> 📊 Estado: ✅ Activas\n> 🖼️ Media: ${config.media ? 'Sí' : 'No'}`;
        if (config.texto) info += `\n\n*Texto:*\n${config.texto}`;
        return msg.reply(info);
      }

      const partes = texto.split('|').map(p => p.trim());
      let horaTexto = partes[0];
      let reglasTexto = partes.slice(1).join('|').trim();

      if (!horaTexto) return msg.reply('❌ Debes especificar la hora y zona.\nEjemplo: `.reglas 22:10 arg | Reglas...`');

      const horaMatch = horaTexto.match(/(\d{1,2})(?::(\d{2}))?/);
      if (!horaMatch) return msg.reply('❌ Hora no válida.');

      const horas = parseInt(horaMatch[1]);
      const minutos = horaMatch[2] ? parseInt(horaMatch[2]) : 0;

      if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) {
        return msg.reply('❌ Hora no válida. Debe estar entre 00:00 y 23:59.');
      }

      let zonaDetectada = null;
      const palabras = horaTexto.toLowerCase().split(/\s+/);
      for (const palabra of palabras) {
        const zonaLimpia = palabra.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        if (zonas[zonaLimpia]) {
          zonaDetectada = zonas[zonaLimpia];
          break;
        }
      }

      if (!zonaDetectada) return msg.reply(`❌ Zona no válida. Usa: ${Object.keys(zonas).join(', ')}`);

      const reglasFinales = reglasTexto.replace(/\\n/g, '\n').trim();

      let mediaGuardada = null;
      if (tieneImagen) {
        const imgMsg = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
        mediaGuardada = { type: 'image', rawMessage: imgMsg };
      } else if (tieneVideo) {
        const vidMsg = msg.message?.videoMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;
        mediaGuardada = { type: 'video', rawMessage: vidMsg };
      }

      // ✅ CÁLCULO DE HORA EN UTC (Igual que compe)
      const ahora = new Date();
      const fechaActualZona = new Date(ahora.toLocaleString('en-US', { timeZone: zonaDetectada.tz }));
      
      const reglasFechaLocal = new Date(fechaActualZona);
      reglasFechaLocal.setHours(horas, minutos, 0, 0);

      if (reglasFechaLocal <= fechaActualZona) {
        reglasFechaLocal.setDate(reglasFechaLocal.getDate() + 1);
      }

      const fechaUTC = new Date(reglasFechaLocal.toLocaleString('en-US', { timeZone: 'UTC' }));
      const fechaZona = new Date(reglasFechaLocal.toLocaleString('en-US', { timeZone: zonaDetectada.tz }));
      const offset = fechaZona.getTime() - fechaUTC.getTime();
      const reglasUTC = new Date(reglasFechaLocal.getTime() - offset);

      console.log(`✅ [REGLAS] Configurada: ${horas}:${minutos.toString().padStart(2, '0')} ${zonaDetectada.emoji}`);
      console.log(`   → UTC a guardar: ${reglasUTC.toISOString()}`);

      // ✅ GUARDAMOS COMO ARRAY (Como compe)
      const configArray = [{
        horaUTC: reglasUTC.toISOString(),
        horaLocal: `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
        zonaEmoji: zonaDetectada.emoji,
        zonaNombre: zonaDetectada.nombre,
        texto: reglasFinales,
        media: mediaGuardada,
        activas: true
      }];

      await db.updateChat(msg.chat, 'reglasConfig', configArray);

      let confirmMsg = `✅ *Reglas configuradas*\n\n`;
      confirmMsg += `> ⏰ Hora: *${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}* ${zonaDetectada.emoji}\n`;
      confirmMsg += `> 📊 Estado: ✅ Activas\n`;
      if (reglasFinales) confirmMsg += `\n*Texto:*\n${reglasFinales}`;
      
      await msg.reply(confirmMsg);

    } catch (e) {
      console.error("❌ [REGLAS ERROR]:", e.message);
      msg.reply(`❌ Ocurrió un error: ${e.message}`);
    }
  },
};
