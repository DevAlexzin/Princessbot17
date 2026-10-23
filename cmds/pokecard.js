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

      let textoCompleto = msg.text || msg.body || '';
      const busqueda = textoCompleto
        .replace(/^[.\/!#]?(pokecard|pokemon|carta)\s*/i, '')
        .trim();

      if (!busqueda) {
        return msg.reply(`🃏 *Buscar Carta Pokémon*

*📋 Uso:* \`.pokecard nombre\`

*📌 Ejemplo:* \`.pokecard pikachu\``);
      }

      console.log(`🔍 [POKECARD] Buscando: ${busqueda}`);

      // ✅ Usamos la API de Pokémon TCG que devuelve un JSON con varias cartas
      const apiUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(busqueda)}*&pageSize=5`;

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.data || json.data.length === 0) {
        return msg.reply(`❌ No se encontraron cartas para *${busqueda}*.`);
      }

      const cartas = json.data;
      console.log(`✅ [POKECARD] Se encontraron ${cartas.length} cartas.`);

      // ✅ Armamos las filas para la LISTA DESPLEGABLE
      const filas = cartas.map((carta, index) => {
        return {
          title: `${carta.name} - ${carta.rarity || 'Común'}`,
          description: `Set: ${carta.set.name} | HP: ${carta.hp || '?'}`,
          rowId: `poke_${index}` // Guardamos el índice
        };
      });

      // ✅ Enviamos el mensaje con la lista (igual que BCP)
      console.log("📤 [POKECARD] Enviando lista desplegable...");

      await sock.sendMessage(msg.chat, {
        text: `🃏 *Cartas encontradas para: ${busqueda}*\n\n> Toca el botón de abajo para ver las opciones.`,
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

      // ✅ Guardamos las cartas en memoria para cuando el usuario elija
      global.pokecardCache = global.pokecardCache || {};
      global.pokecardCache[msg.chat] = cartas;

      console.log("✅ [POKECARD] Lista enviada correctamente.");

    } catch (e) {
      console.error("❌ [POKECARD ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al buscar la carta.');
    }
  }
};
