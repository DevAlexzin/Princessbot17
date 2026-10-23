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

*📌 Ejemplo:* \`.pokecard pikachu\``);
      }

      console.log(`🔍 [POKECARD] Buscando: ${busqueda}`);

      // 2. Llamamos a la API
      const apiUrl = `https://api.delirius.online/search/pokecard?text=${encodeURIComponent(busqueda)}`;
      
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      // ✅ 3. Verificamos el tipo de contenido que devuelve la API
      const contentType = res.headers.get('content-type') || '';
      console.log(`📄 [POKECARD] Content-Type: ${contentType}`);

      // ✅ CASO 1: La API devuelve una imagen directamente (como en tu error)
      if (contentType.includes('image')) {
        console.log('🖼️ [POKECARD] La API devolvió una imagen. Enviándola...');
        
        // Convertimos la respuesta a un Buffer
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length === 0) {
          return msg.reply('❌ La imagen de la carta está vacía.');
        }

        // Enviamos la imagen
        await sock.sendMessage(msg.chat, {
          image: buffer,
          caption: `🃏 *Carta Pokémon: ${busqueda}*\n\n> 🔎 Búsqueda realizada con éxito.`
        }, { quoted: msg });

        console.log('✅ [POKECARD] Imagen enviada correctamente.');
        return;
      }

      // ✅ CASO 2: La API devuelve un JSON (por si cambia en el futuro)
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

      await sock.sendMessage(msg.chat, {
        image: { url: imagenUrl },
        caption: `🃏 *Carta Pokémon: ${data.name || busqueda}*`
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [POKECARD ERROR]:", e.message);
      msg.reply(msgglobal || '❌ Ocurrió un error al buscar la carta.');
    }
  }
};
