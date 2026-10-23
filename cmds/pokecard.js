import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['pokecard', 'pokemon', 'carta'],
  category: 'search',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      console.log("========================================");
      console.log("🔍 [DEBUG] Comando 'pokecard' ejecutado.");
      console.log("========================================");

      // 1. Extraemos el nombre del pokémon
      let textoCompleto = msg.text || msg.body || '';
      const busqueda = textoCompleto
        .replace(/^[.\/!#]?(pokecard|pokemon|carta)\s*/i, '')
        .trim();

      if (!busqueda) {
        return msg.reply(`🃏 *Buscar Carta Pokémon*

*📋 Uso:* \`.pokecard nombre\`

*📌 Ejemplo:* \`.pokecard charizard\``);
      }

      console.log(`🔍 [POKECARD] Buscando: ${busqueda}`);

      // 2. Llamamos a la API
      const apiUrl = `https://api.delirius.online/search/pokecard?text=${encodeURIComponent(busqueda)}`;
      
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const textoRespuesta = await res.text();

      // 3. Verificamos que la API no devuelva HTML (caída o error)
      if (textoRespuesta.startsWith('<!DOCTYPE') || textoRespuesta.startsWith('<html')) {
        console.log('⚠️ [POKECARD] La API devolvió HTML');
        return msg.reply('❌ La API no está disponible en este momento. Intenta más tarde.');
      }

      // 4. Parseamos el JSON
      let json;
      try {
        json = JSON.parse(textoRespuesta);
      } catch (e) {
        console.error('⚠️ [POKECARD] Error parseando JSON:', textoRespuesta.slice(0, 200));
        return msg.reply('❌ La API devolvió una respuesta inválida.');
      }

      // 5. Verificamos que la respuesta sea exitosa y tenga resultados
      if (!json.status || !json.data || json.data.length === 0) {
        return msg.reply(`❌ No se encontraron cartas para *${busqueda}*.`);
      }

      const cartas = json.data;
      console.log(`✅ [POKECARD] Se encontraron ${cartas.length} cartas.`);

      // 6. Armamos las filas para la lista desplegable
      // (Máximo 10 filas para que no falle)
      const filas = cartas.slice(0, 10).map((carta, index) => {
        return {
          title: `${carta.name || 'Carta'} - ${carta.rarity || 'Común'}`,
          description: `Tipo: ${carta.type || '?'} | HP: ${carta.hp || '?'}`,
          rowId: `poke_${index}` // Guardamos el índice para saber qué carta eligió
        };
      });

      // 7. Enviamos el mensaje con la lista
      console.log("📤 [POKECARD] Enviando lista desplegable...");

      await sock.sendMessage(msg.chat, {
        text: `🃏 *Cartas encontradas para: ${busqueda}*\n\n> Toca el botón de abajo para ver las opciones disponibles.`,
        footer: 'Princess Bot',
        title: 'Selecciona una Carta',
        buttonText: 'Ver Cartas',
        sections: [
          {
            title: `Resultados (${cartas.length})`,
            rows: filas
          }
        ]
      }, { quoted: msg });

      console.log("✅ [POKECARD] Lista enviada correctamente.");

      // ✅ Guardamos temporalmente los resultados en memoria
      // Para que cuando el usuario elija una carta en el handler, podamos enviarla
      global.pokecardCache = global.pokecardCache || {};
      global.pokecardCache[msg.chat] = cartas;

    } catch (e) {
      console.error("❌ [POKECARD ERROR]:", e.message);
      console.error(e.stack);
      msg.reply(msgglobal || '❌ Ocurrió un error al buscar la carta.');
    }
  },
};
