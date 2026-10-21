import db from "#db"

export default {
  command: ['versusg', 'versusganado', 'vg'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto.replace(/^[.\/!#]?(versusg|versusganado|vg)\s*/i, '').trim();

      if (!texto) {
        return msg.reply(`🏆 *Registrar Versus Ganado*

*📋 Formato:*
\`.versusg Nombre1/Nombre2/Nombre3/Nombre4/Modo/Hora Zona\`

*📌 Ejemplo:*
\`.versusg Daniel/ro/emy/Sof/500/18 ARG\``);
      }

      const partes = texto.split('/').map(p => p.trim());

      if (partes.length < 6) {
        return msg.reply('❌ *Faltan datos.*\n\nDebes usar el formato:\n`Nombre1/Nombre2/Nombre3/Nombre4/Modo/Hora Zona`\n\n*Ejemplo:* `.versusg Daniel/ro/emy/Sof/500/18 ARG`');
      }

      const jugadoras = [partes[0], partes[1], partes[2], partes[3]];
      const modo = partes[4];
      const horaTexto = partes[5];

      const zonas = {
        arg: { nombre: 'Argentina', tz: 'America/Argentina/Buenos_Aires', emoji: '🇦🇷' },
        peru: { nombre: 'Perú', tz: 'America/Lima', emoji: '🇵🇪' },
        col: { nombre: 'Colombia', tz: 'America/Bogota', emoji: '🇨🇴' },
        mex: { nombre: 'México', tz: 'America/Mexico_City', emoji: '🇲🇽' },
        chile: { nombre: 'Chile', tz: 'America/Santiago', emoji: '🇨🇱' },
        esp: { nombre: 'España', tz: 'Europe/Madrid', emoji: '🇪🇸' }
      };

      const horaMatch = horaTexto.match(/(\d{1,2})(?::(\d{2}))?/);
      if (!horaMatch) return msg.reply('❌ Hora no válida. Usa formato `18` o `18:30`.');

      const horas = parseInt(horaMatch[1]);
      const minutos = horaMatch[2] ? parseInt(horaMatch[2]) : 0;

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

      // ✅ OBTENER LA FECHA AUTOMÁTICAMENTE
      const ahora = new Date();
      const fechaActualZona = new Date(ahora.toLocaleString('en-US', { timeZone: zonaDetectada.tz }));
      const dia = fechaActualZona.getDate().toString().padStart(2, '0');
      const mes = (fechaActualZona.getMonth() + 1).toString().padStart(2, '0');
      const fechaFormateada = `${dia}-${mes}`;
      const horaFormateada = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;

      const emojiDia = { 0: '✨', 1: '💙', 2: '🌊', 3: '🫐', 4: '🪽', 5: '🌀', 6: '✨' };
      const emojiHoy = emojiDia[fechaActualZona.getDay()];

      // ✅ GUARDAR EN LA LISTA DEL DÍA
      const chatData = await db.getChat(msg.chat);
      const dbKeyVs = `versus_dia_${fechaFormateada}`; // Cambiado a versus_dia_
      let versusHoy = chatData[dbKeyVs] || [];
      
      versusHoy.push({
        hora: horaFormateada,
        zona: zonaDetectada.emoji,
        jugadoras: jugadoras.filter(j => j),
        modo: modo,
        fecha: fechaFormateada
      });
      
      await db.updateChat(msg.chat, dbKeyVs, versusHoy);

      // ✅ CONECTAR CON EL PARTI (+1 CORAZÓN A CADA UNA)
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);
      const dbKeyParti = `participacion_semana_${año}_${semana}`;
      
      let registrosParti = chatData[dbKeyParti] || [];

      for (const nombreJugadora of jugadoras) {
        if (!nombreJugadora) continue;
        const nombreKey = nombreJugadora.toLowerCase().trim();
        
        let personaParti = registrosParti.find(r => r.nombre.toLowerCase().trim() === nombreKey);
        if (!personaParti) {
          personaParti = { nombre: nombreJugadora, corazones: [], fechaRegistro: ahora.toISOString() };
          registrosParti.push(personaParti);
        }
        personaParti.corazones.push(emojiHoy);

        const perfilKey = `perfil_${nombreKey}`;
        const chatDataActualizado = await db.getChat(msg.chat);
        if (chatDataActualizado[perfilKey]) {
          chatDataActualizado[perfilKey].versusJugados = (chatDataActualizado[perfilKey].versusJugados || 0) + 1;
          await db.updateChat(msg.chat, perfilKey, chatDataActualizado[perfilKey]);
        }
      }
      
      await db.updateChat(msg.chat, dbKeyParti, registrosParti);

      // ✅ MOSTRAR LA LISTA DEL DÍA ACTUAL
      const versusOrdenados = versusHoy.sort((a, b) => parseInt(a.hora) - parseInt(b.hora));
      let mensajeLista = `📅 *Versus del ${fechaFormateada}*\n\n`;

      for (const v of versusOrdenados) {
        let listaJugadoras = '';
        for (const j of v.jugadoras) listaJugadoras += `𐔌🌈𐦯 ${j}\n`;

        mensajeLista += `┈─˖Ი𐑼⋆🏹 𝗩𝗲𝗿𝘀𝘂𝘀 𝗴𝗮𝗻𝗮𝗱𝗼\n\n`;
        mensajeLista += `✮ ╴╴╴╴✮ ╴╴╴╴✮ ╴╴╴╴✮ \n\n`;
        mensajeLista += `᭝ ᨳଓ ՟ 𝗝𝘂𝗴𝗮𝗱𝗼𝗿𝗮𝘀\n`;
        mensajeLista += listaJugadoras;
        mensajeLista += `\n─⋆ ▸ ›🍯 𝑴𝒐𝒅𝒐 ⸝⸝ ${v.modo}\n`;
        mensajeLista += `─⋆ ▸ ›🍒 𝑭𝒆𝒄𝒉𝒂 ⸝⸝ ${v.hora}${v.zona} ${v.fecha}\n\n`;
      }

      await sock.sendMessage(msg.chat, { text: mensajeLista.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [VERSUSG ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al registrar el versus.');
    }
  },
};
