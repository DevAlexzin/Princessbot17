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
      // Extraemos el texto del mensaje tal como lo hace tu comando info
      const textoCompleto = msg.text || msg.body || '';
      console.log("📝 [DEBUG] Texto completo del mensaje:", textoCompleto);

      // Quitamos el comando ".versus" y separamos por "|"
      const textoLimpio = textoCompleto.replace(/^\.versus\s*/i, '').trim();
      console.log("🧹 [DEBUG] Texto limpio (sin comando):", textoLimpio);

      const partes = textoLimpio.split('|').map(item => item.trim());
      console.log("📊 [DEBUG] Partes separadas por '|':", partes);

      // Asignamos los valores (con valores por defecto)
      const igRival = partes[0] || '@usuario';
      const numRival = partes[1] || '+00 000 000-0000';
      const reglas = partes[2] || 'nuestras';
      const modalidad = partes[3] || '500';
      const horaDia = partes[4] || '22🇦🇷 — 09/Octubre';

      console.log("✅ [DEBUG] Datos extraídos:");
      console.log("   - Ig Rival:", igRival);
      console.log("   - Num Rival:", numRival);
      console.log("   - Reglas:", reglas);
      console.log("   - Modalidad:", modalidad);
      console.log("   - Hora/Día:", horaDia);

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
      
      // Usamos la misma estructura que tu comando info
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
