import db from "#db"
import { normalizar, ocultarPalabra, mostrarAhorcado } from "./ahorcado.js"

const intentosMaximos = 6;

export default {
  type: 'before',
  run: async ({ msg, sock, command }) => {
    try {
      // ✅ LOG 1: Ver si el listener se ejecuta
      console.log(`🔍 [AHORCADO DEBUG] Listener ejecutado. Texto: "${msg.text}" | Comando: "${command}"`);

      if (command || msg.fromMe || !msg.text) {
        console.log(`🔍 [AHORCADO DEBUG] Ignorado (es comando, fromMe o sin texto).`);
        return false;
      }

      const sender = msg.sender;
      const juego = global.ahorcado?.[sender];
      
      // ✅ LOG 2: Ver si el usuario tiene un juego activo
      if (!juego) {
        console.log(`🔍 [AHORCADO DEBUG] No hay juego activo para: ${sender}`);
        return false;
      }

      console.log(`✅ [AHORCADO DEBUG] Juego activo para ${sender}. Palabra: ${juego.palabra}`);

      let { palabra, letrasAdivinadas, intentos } = juego;
      const palabraNorm = normalizar(palabra);
      const texto = msg.text.trim().toLowerCase();

      // ✅ SI ENVÍA UNA SOLA LETRA
      if (/^[a-zñ]$/i.test(texto)) {
        console.log(`🎯 [AHORCADO DEBUG] Letra detectada: "${texto}"`);
        
        let letra = normalizar(texto);

        if (letrasAdivinadas.includes(letra)) {
          await sock.sendMessage(msg.chat, { text: `❌ Ya intentaste la letra "${letra}".` }, { quoted: msg });
          return true;
        }

        letrasAdivinadas.push(letra);

        if (!palabraNorm.includes(letra)) {
          intentos--;
          console.log(`❌ [AHORCADO DEBUG] Letra incorrecta. Intentos restantes: ${intentos}`);
        } else {
          console.log(`✅ [AHORCADO DEBUG] Letra correcta.`);
        }

        let mensajeActual = ocultarPalabra(palabraNorm, letrasAdivinadas);
        global.ahorcado[sender] = { palabra, letrasAdivinadas, intentos };

        if (intentos <= 0) {
          delete global.ahorcado[sender];
          await sock.sendMessage(msg.chat, { text: `❌ ¡Perdiste! La palabra era: *${palabra}*` }, { quoted: msg });
          console.log(`🏁 [AHORCADO DEBUG] Juego terminado (Perdió).`);
          return true;
        }

        if (!mensajeActual.includes("_")) {
          let exp = Math.floor(Math.random() * 300);
          if (palabra.length >= 8) exp = Math.floor(Math.random() * 3500);
          db.updateUser(sender, 'exp', exp).catch(() => {});
          delete global.ahorcado[sender];
          await sock.sendMessage(msg.chat, { text: `🎉 ¡Ganaste! Adivinaste la palabra *${palabra}*\n\nHas ganado: *${exp} Exp*` }, { quoted: msg });
          console.log(`🏁 [AHORCADO DEBUG] Juego terminado (Ganó).`);
          return true;
        }

        await sock.sendMessage(msg.chat, {
          text: `${mostrarAhorcado(intentos)}\n\n${mensajeActual}\n\n💡 Letras usadas: ${letrasAdivinadas.join(", ")}\n🎯 Intentos restantes: ${intentos}\n> solo quién usa el comando puede intentar.`
        }, { quoted: msg });
        
        console.log(`📤 [AHORCADO DEBUG] Mensaje de actualización enviado.`);
        return true;
      }

      // ✅ SI ENVÍA UNA PALABRA COMPLETA
      if (texto.length > 1) {
        console.log(`🎯 [AHORCADO DEBUG] Palabra detectada: "${texto}"`);
        let intento = normalizar(texto);

        if (intento === palabraNorm) {
          let exp = Math.floor(Math.random() * 300);
          if (palabra.length >= 8) exp = Math.floor(Math.random() * 3500);
          db.updateUser(sender, 'exp', exp).catch(() => {});
          delete global.ahorcado[sender];
          await sock.sendMessage(msg.chat, { text: `🎉 ¡Ganaste adivinando la palabra completa!\n\nLa palabra era: *${palabra}*\nHas ganado: *${exp} Exp*` }, { quoted: msg });
          console.log(`🏁 [AHORCADO DEBUG] Juego terminado (Ganó palabra completa).`);
          return true;
        }

        intentos--;
        if (intentos <= 0) {
          delete global.ahorcado[sender];
          await sock.sendMessage(msg.chat, { text: `❌ Palabra incorrecta. Has perdido.\nLa palabra era: *${palabra}*` }, { quoted: msg });
          console.log(`🏁 [AHORCADO DEBUG] Juego terminado (Perdió palabra completa).`);
          return true;
        }

        global.ahorcado[sender] = { palabra, letrasAdivinadas, intentos };
        await sock.sendMessage(msg.chat, {
          text: `❌ Palabra incorrecta. Pierdes un intento.\n\n${mostrarAhorcado(intentos)}\n🎯 Intentos restantes: ${intentos}\n> solo quién usa el comando puede intentar.`
        }, { quoted: msg });
        console.log(`❌ [AHORCADO DEBUG] Palabra incorrecta. Intentos: ${intentos}`);
        return true;
      }

      console.log(`⚠️ [AHORCADO DEBUG] El texto no entró en ninguna condición (ni letra ni palabra).`);
      return false;

    } catch (e) {
      console.error("❌ [AHORCADO LISTENER ERROR]:", e);
    }
    return false;
  }
};
