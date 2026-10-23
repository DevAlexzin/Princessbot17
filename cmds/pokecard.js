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

      // ✅ 1. Llamamos a la API de Delirius
      const apiUrl = `https://api.delirius.online/search/pokecard?text=${encodeURIComponent(busqueda)}`;
      
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // ✅ 2. Verificamos el tipo de contenido
      const contentType = res.headers.get('content-type') || '';
      console.log(`📄 [POKECARD] Content-Type: ${contentType}`);

      // ✅ Si es una imagen, la guardamos en memoria y creamos la lista
      if (contentType.includes('image')) {
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
          return msg.reply('❌ La imagen de la carta está vacía.');
        }

        // ✅ Guardamos la imagen en caché para cuando el usuario la elija
        global.pokecardCache = global.pokecardCache || {};
        global.pokecardCache[msg.chat] = {
          busqueda: busqueda,
          buffer: buffer
        };

        // ✅ Creamos la lista desplegable
        await sock.sendMessage(msg.chat, {
          text: `🃏 *Cartas encontradas para: ${busqueda}*\n\n> Toca el botón de abajo para ver las opciones.`,
          footer: 'Princess Bot',
          title: 'Selecciona una Carta',
          buttonText: 'Ver Cartas',
          sections: [
            {
              title: `Resultados (1)`,
              rows: [
                {
                  title: `${busqueda} (Carta encontrada)`,
                  description: 'Toca para ver la imagen de la carta.',
                  rowId: `poke_0`
                }
              ]
            }
          ]
        }, { quoted: msg });

        console.log('✅ [POKECARD] Lista enviada (imagen en caché).');
        return;
      }

      // ✅ Si la API devuelve JSON (fallback por si acaso)
      const textoRespuesta = await res.text();
      
      if (textoRespuesta.startsWith('<!DOCTYPE') || textoRespuesta.startsWith('<html')) {
        console.log('⚠️ [POKECARD] La API devolvió HTML');
        return msg.reply('❌ La API no está disponible en este momento.');
      }

      let json;
      try {
        json = JSON.parse(textoRespuesta);
      } catch (e) {
        console.error('⚠️ [POKECARD] Error parseando JSON:', textoRespuesta.slice(0, 200));
        return msg.reply('❌ La API devolvió un formato desconocido.');
      }

      if (!json.status || !json.data) {
        return msg.reply(`❌ No se encontró ninguna carta para *${busqueda}*.`);
      }

      const data = json.data;
      const imagenUrl = data.image || data.images?.large || data.card_images?.[0]?.image_url;

      if (!imagenUrl) {
        return msg.reply('❌ No se encontró la imagen de la carta.');
      }

      // Guardamos la URL en caché
      global.pokecardCache = global.pokecardCache || {};
      global.pokecardCache[msg.chat] = {
        busqueda: busqueda,
        url: imagenUrl
      };

      // Creamos la lista desplegable
      await sock.sendMessage(msg.chat, {
        text: `🃏 *Cartas encontradas para: ${busqueda}*\n\n> Toca el botón de abajo para ver las opciones.`,
        footer: 'Princess Bot',
        title: 'Selecciona una Carta',
        buttonText: 'Ver Cartas',
        sections: [
          {
            title: `Resultados (1)`,
            rows: [
              {
                title: `${data.name || busqueda} (Carta encontrada)`,
                description: 'Toca para ver la imagen de la carta.',
                rowId: `poke_0`
              }
            ]
          }
        ]
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [POKECARD ERROR]:", e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error al buscar la carta.');
    }
  }
};
