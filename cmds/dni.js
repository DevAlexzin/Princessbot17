import db from "#db"
import fetch from "node-fetch"

export default {
  command: ["dni", "reniec"],
  category: "tools",
  botAdmin: false,
  run: async ({ msg, sock, args }) => {
    try {
      const dni = args[0];
      if (!dni || !/^\d{8}$/.test(dni)) {
        return msg.reply("❌ Debes ingresar un DNI válido de 8 dígitos.\n\n*Ejemplo:* `.dni 12345678`");
      }

      // ⚠️ PEGA TU NUEVO TOKEN AQUÍ
      const token = "3PTHRsi2QxhKDHrcwu2izm1p0iLRIUrXk2uR5SknsmneA31K8W3LHmKThsba"; 
      
      // ⚠️ PEGA LA URL EXACTA AQUÍ
      const apiUrl = "https://api-codart.cgrt.org/RUTA_EXACTA/" + dni; 

      console.log("🔍 [RENIEC] Consultando DNI: " + dni + " en " + apiUrl);

      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        return msg.reply("❌ Error en la API (Código: " + res.status + ").\n\n> Verifica que la URL y el Token sean correctos.");
      }

      const json = await res.json();
      const data = json.data || json; 
      
      if (!data.nombres) {
        return msg.reply("❌ No se encontró información para ese DNI.");
      }

      const mensaje = "🪪 *CONSULTA RENIEC*\n\n> 👤 *Nombres:* " + data.nombres + "\n> 👤 *Apellidos:* " + (data.apellidoPaterno || "") + " " + (data.apellidoMaterno || "") + "\n> 🆔 *DNI:* " + (data.dni || dni) + "\n\n> 🔒 _Consulta realizada de forma segura_";

      await sock.sendMessage(msg.chat, { text: mensaje }, { quoted: msg });

    } catch (e) {
      console.error("❌ [DNI ERROR]:", e.message);
      msg.reply("❌ Ocurrió un error al conectar con la API.");
    }
  }
};
