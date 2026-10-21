import db from "#db"
import { mostrarAhorcado } from "./ahorcado.js"

const intentosMaximos = 6;

function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function ocultarPalabra(palabra, letrasAdivinadas) {
    let salida = "";
    for (const letra of palabra) {
        salida += letrasAdivinadas.includes(letra) ? letra + " " : "_ ";
    }
    return salida.trim();
}

function terminarJuego(sender, palabra, mensajeActual, intentos, letrasAdivinadas) {
    if (intentos <= 0) {
        delete global.ahorcado[sender];
        return {
            terminado: true,
            mensaje: `❌ ¡Perdiste! La palabra era: *${palabra}*`
        };
    }

    if (!mensajeActual.includes("_")) {
        let exp = Math.floor(Math.random() * 300);
        if (palabra.length >= 8) exp = Math.floor(Math.random() * 3500);

        // Guardar exp en la base de datos de tu bot
        db.updateUser(sender, 'exp', exp).catch(() => {});
        delete global.ahorcado[sender];

        return {
            terminado: true,
            mensaje: `🎉 ¡Ganaste! Adivinaste la palabra *${palabra}*\n\nHas ganado: *${exp} Exp*`
        };
    }

    return {
        terminado: false,
        mensaje: `${mostrarAhorcado(intentos)}\n\n${mensajeActual}\n\n💡 Letras usadas: ${letrasAdivinadas.join(", ")}\n🎯 Intentos restantes: ${intentos}\n> solo quién usa el comando puede intentar.`
    };
}

export default {
  type: 'before',
  run: async ({ msg, sock, command }) => {
    try {
      // Si el mensaje es un comando, lo ignoramos
      if (command || msg.fromMe || !msg.text) return false;

      const sender = msg.sender;
      const juego = global.ahorcado?.[sender];
      
      // Si el usuario no tiene un juego activo, no hacemos nada
      if (!juego) return false;

      let { palabra, letrasAdivinadas, intentos } = juego;
      const palabraNorm = normalizar(palabra);
      const texto = msg.text.trim().toLowerCase();

      // ✅ SI ENVÍA UNA SOLA LETRA
      if (/^[a-zñ]$/i.test(texto)) {
        let letra = normalizar(texto);

        if (letrasAdivinadas.includes(letra)) {
          await sock.sendMessage(msg.chat, { text: `❌ Ya intentaste la letra "${letra}".` }, { quoted: msg });
          return true; // Detenemos el flujo normal
        }

        letrasAdivinadas.push(letra);

        if (!palabraNorm.includes(letra)) {
          intentos--;
        }

        let mensajeActual = ocultarPalabra(palabraNorm, letrasAdivinadas);
        global.ahorcado[sender] = { palabra, letrasAdivinadas, intentos };

        let r = terminarJuego(sender, palabra, mensajeActual, intentos, letrasAdivinadas);
        await sock.sendMessage(msg.chat, { text: r.mensaje }, { quoted: msg });
        return true;
      }

      // ✅ SI ENVÍA UNA PALABRA COMPLETA
      if (texto.length > 1) {
        let intento = normalizar(texto);

        if (intento === palabraNorm) {
          let exp = Math.floor(Math.random() * 300);
          if (palabra.length >= 8) exp = Math.floor(Math.random() * 3500);

          db.updateUser(sender, 'exp', exp).catch(() => {});
          delete global.ahorcado[sender];

          await sock.sendMessage(msg.chat, {
            text: `🎉 ¡Ganaste adivinando la palabra completa!\n\nLa palabra era: *${palabra}*\nHas ganado: *${exp} Exp*`
          }, { quoted: msg });
          return true;
        }

        intentos--;
        if (intentos <= 0) {
          delete global.ahorcado[sender];
          await sock.sendMessage(msg.chat, { text: `❌ Palabra incorrecta. Has perdido.\nLa palabra era: *${palabra}*` }, { quoted: msg });
          return true;
        }

        global.ahorcado[sender] = { palabra, letrasAdivinadas, intentos };
        await sock.sendMessage(msg.chat, {
          text: `❌ Palabra incorrecta. Pierdes un intento.\n\n${mostrarAhorcado(intentos)}\n🎯 Intentos restantes: ${intentos}\n> solo quién usa el comando puede intentar.`
        }, { quoted: msg });
        return true;
      }

    } catch (e) {
      console.error("❌ [AHORCADO LISTENER ERROR]:", e.message);
    }
    return false;
  }
};
