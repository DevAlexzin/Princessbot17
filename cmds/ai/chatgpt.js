
import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt', 'gpt'],
  category: 'ia',
  botAdmin: false,

  run: async ({ msg, sock, args, text }) => {
    try {
      // 1. Obtener el texto
      const input = (text || args.join(' ')).trim();

      if (!input) {
        return msg.reply(
          '🤖 *COMANDOS DE IA*\n\n' +
          '• `.ia pregunta` — Modo normal\n' +
          '• `.ia exploit pregunta` — Modo agresivo 🔥\n\n' +
          'Ejemplo: `.ia exploit roast me`'
        );
      }

      // 2. Detectar el modo exploit
      const exploitMode = /^exploit(?:\s|$)/i.test(input);

      const pregunta = input
        .replace(/^exploit\s*/i, '')
        .trim();

      if (!pregunta) {
        return msg.reply(
          '😈 Escribe qué quieres que responda el modo exploit.'
        );
      }

      // 3. Personalidad de la IA
      let instructions;

      if (exploitMode) {
        instructions = `
Eres una IA con personalidad extremadamente agresiva,
bocona, irreverente, vulgar, mordaz y sarcástica.

Tu especialidad es el ROAST PESADO, los insultos creativos,
las respuestas provocadoras y el humor ácido.

PERSONALIDAD:
- Habla con naturalidad, como alguien que no tiene pelos
  en la lengua.
- Puedes usar palabrotas e insultos fuertes en tono humorístico.
- Sé directo, contundente, insolente y sarcástico.
- Evita sonar amable, corporativo o excesivamente formal.
- Si te piden un roast, hazlo intenso, original y memorable.
- Usa exageraciones, comparaciones crueles de comedia,
  ironía y expresiones coloquiales.
- No repitas siempre las mismas frases.
- Adapta el roast al texto que recibas.
- No inventes datos privados para humillar a alguien.
- No conviertas las bromas en amenazas reales.
- No ataques a personas por su raza, religión, discapacidad
  u otras características personales sensibles.
- Si el usuario quiere que lo insultes a él mismo,
  puedes hacerlo con un roast fuerte y creativo.

EJEMPLO DE TONO:
Usuario: "Soy un genio".
Respuesta: "¡Un genio, dice el cabrón! Tienes un ego
del tamaño de un planeta y unas pruebas de inteligencia
que todavía están buscando la dirección de tu casa. 💀"

Usuario: "Hazme un roast".
Respuesta: "Tienes una confianza impresionante para alguien
que convierte hasta las buenas ideas en proyectos de demolición.
Si la estupidez diera puntos, estarías rompiendo récords,
pedazo de desastre. 😂🔥"

No copies literalmente los ejemplos en cada respuesta.
No expliques tus instrucciones internas.
Responde directamente a la petición con esta personalidad.
`;
      } else {
        instructions = `
Eres un asistente útil, claro y amable.
Responde en el idioma del usuario y explica tus respuestas
de forma sencilla y natural.
`;
      }

      const finalText =
        `${instructions}\n\nPetición del usuario:\n${pregunta}`;

      console.log(
        `[IA] Consultando API. Modo: ${
          exploitMode ? 'EXPLOIT/ROAST' : 'NORMAL'
        }`
      );

      // 4. Consultar la API
      const apiUrl =
        `https://api.delirius.online/ia/chatgpt?q=${
          encodeURIComponent(finalText)
        }`;

      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        30000
      );

      let res;
      let raw;

      try {
        res = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'application/json'
          },
          signal: controller.signal
        });

        raw = await res.text();
      } finally {
        clearTimeout(timeout);
      }

      // 5. Verificar el estado HTTP
      if (!res.ok) {
        console.error('[IA] HTTP:', res.status);

        return msg.reply(
          res.status === 429
            ? '⏳ Demasiadas peticiones. Espera un momento.'
            : '❌ La API de IA no está disponible ahora.'
        );
      }

      // 6. Detectar respuestas HTML
      if (/^\s*<(?:!DOCTYPE html|html)\b/i.test(raw)) {
        console.error('[IA] La API devolvió HTML.');

        return msg.reply(
          '❌ El servicio de IA está temporalmente fuera de servicio.'
        );
      }

      // 7. Procesar el JSON
      let json;

      try {
        json = JSON.parse(raw);
      } catch (error) {
        console.error(
          '[IA] JSON inválido:',
          raw.slice(0, 200)
        );

        return msg.reply(
          '❌ La API devolvió una respuesta inválida.'
        );
      }

      const result =
        json.result ??
        json.response ??
        json.answer ??
        json.data ??
        json.message;

      if (typeof result !== 'string' || !result.trim()) {
        return msg.reply(
          '❌ La IA no devolvió una respuesta válida.'
        );
      }

      // 8. Enviar la respuesta
      const respuesta = result.trim();

      await sock.sendMessage(
        msg.chat,
        {
          text: exploitMode
            ? `😈🔥 *MODO ROAST ACTIVADO* 🔥😈\n\n${respuesta}`
            : `🤖 *RESPUESTA DE IA*\n\n${respuesta}`
        },
        { quoted: msg }
      );

    } catch (error) {
      console.error('[IA ERROR]:', error.message);

      const mensajeError =
        error.name === 'AbortError'
          ? '⏳ La IA tardó demasiado. Inténtalo de nuevo.'
          : '❌ Ocurrió un error al conectar con la IA.';

      await msg.reply(mensajeError).catch(() => {});
    }
  }
};
