import db from "#db"

export default {
  command: ['versus'],
  category: 'grupo',
  botAdmin: true,
  run: async ({ msg, sock }) => {
    console.log("========================================");
    console.log("🔍 [DEBUG] Comando 'versus' ejecutado.");
    console.log("📩 [DEBUG] Mensaje completo:", JSON.stringify(msg, null, 2));
    console.log("========================================");

    try {
      // Extraemos el texto del mensaje
      const textoCompleto = msg.text || msg.body || '';
      console.log("📝 [DEBUG] Texto completo del mensaje:", textoCompleto);

      // Quitamos el comando ".versus" y separamos por "|"
      const textoLimpio = textoCompleto.replace(/^\.versus\s*/i, '').trim();
      console.log("🧹 [DEBUG] Texto limpio (sin comando):", textoLimpio);

      // ✅ Si no hay datos, pedir los datos
      if (!textoLimpio || textoLimpio === '') {
        const pedirDatos = `˖ ݁⋆.˚🏹 𝙑𝙚𝙧𝙨𝙪𝙨 𝙘𝙤𝙤𝙧𝙙𝙞𝙣𝙖𝙙𝙤

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

> ❌ *Faltan datos para el versus.*
> Por favor, envía el comando con los datos separados por *|* (barras verticales).

*📋 Formato requerido:*
\`.versus @ig_rival | +00 000 000-0000 | reglas | modalidad | hora\`

*📌 Ejemplo:*
\`.versus @nexus_hikari | +54 9 383 492-2367 | nuestras | 500 | 22🇦🇷\`

> 💡 *Nota:* El día y la fecha se agregan automáticamente, solo debes enviar la hora del versus.`;

        await sock.sendMessage(msg.chat, { text: pedirDatos.trim() }, { quoted: msg });
        console.log("📤 [DEBUG] Mensaje de 'faltan datos' enviado.");
        return;
      }

      const partes = textoLimpio.split('|').map(item => item.trim());
      console.log("📊 [DEBUG] Partes separadas por '|':", partes);

      // Asignamos los valores
      const igRival = partes[0] || '@usuario';
      const numRival = partes[1] || '+00 000 000-0000';
      const reglas = partes[2] || 'nuestras';
      const modalidad = partes[3] || '500';
      
      // ✅ El usuario envía la hora (o si no, usamos la hora actual como respaldo)
      const ahora = new Date();
      const horas = ahora.getHours().toString().padStart(2, '0');
      const minutos = ahora.getMinutes().toString().padStart(2, '0');
      const horaActual = `${horas}:${minutos}`;
      
      // Si el usuario puso hora, la usamos. Si no, usamos la hora actual.
      const horaPersonalizada = partes[4] || horaActual;

      // ✅ El bot genera el día y la fecha automáticamente
      const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      
      const diaSemana = diasSemana[ahora.getDay()];
      const diaMes = ahora.getDate();
      const mesActual = meses[ahora.getMonth()];
      
      // Construimos: "16 🇵🇪 — Lunes, 10 de Octubre"
      const horaDia = `${horaPersonalizada} — ${diaSemana}, ${diaMes} de ${mesActual}`;

      console.log("✅ [DEBUG] Datos extraídos:");
      console.log("   - Ig Rival:", igRival);
      console.log("   - Num Rival:", numRival);
      console.log("   - Reglas:", reglas);
      console.log("   - Modalidad:", modalidad);
      console.log("   - Hora (usuario):", horaPersonalizada);
      console.log("   - Fecha (auto):", `${diaSemana}, ${diaMes} de ${mesActual}`);
      console.log("   - Resultado final:", horaDia);

      const versusMsg = `˖ ݁⋆.˚🏹 𝙑𝙚𝙧𝙨𝙪𝙨 𝙘𝙤𝙤𝙧𝙙𝙞𝙣𝙖𝙙𝙤

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

்⋆ ✮👸🏻 Logo

்⋆ ✮🪩 Ig rιvᥲᥣ
ㅤ╰─⋆ ▸ › ${igRival}

்⋆ ✮🌈 Nᥙm rιvᥲᥣ
ㅤ╰─⋆ ▸ › ${numRival}

்⋆ ✮🌷 Rᥱgᥣᥲs
ㅤ╰─⋆ ▸ › ${reglas}

்⋆ ✮🍯 Modᥲᥣιdᥲd
ㅤ╰─⋆ ▸ › ${modalidad}

்⋆ ✮🍒 Horᥲrιo/Dιᥲ
ㅤ╰─⋆ ▸ › ${horaDia}`;

      console.log("📤 [DEBUG] Enviando mensaje...");
      
      await sock.sendMessage(msg.chat, { text: versusMsg.trim() }, { quoted: msg });
      
      console.log("✅ [DEBUG] Mensaje enviado con éxito.");

    } catch (e) {
      console.error("❌ [ERROR CRÍTICO] Fallo en el comando versus:");
      console.error("   - Mensaje de error:", e.message);
      console.error("   - Stack trace:", e.stack);
      
      msg.reply('❌ Ocurrió un error al procesar el versus.');
    }
  },
};
