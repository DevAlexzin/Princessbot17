import db from "#db"
import fetch from 'node-fetch'

export default {
  command: ['dni', 'reniec'],
  category: 'tools',
  botAdmin: false,
  run: async ({ msg, sock, args }) => {
    try {
      const dni = args[0];
      if (!dni || !/^\d{8}$/.test(dni)) {
        return msg.reply('❌ Debes ingresar un DNI válido de 8 dígitos.\n\n*Ejemplo:* `.dni 12345678`');
      }

      // ✅ IMPORTANTE: Pega aquí el NUEVO token que generes
      const token = '3PTHRsi2QxhKDHrcwu2izm1p0iLRIUrXk2uR5SknsmneA31K8W3LHmKThsba'; 
      
      // ✅ Aquí va la URL exacta. Debes verificar en la documentación de Codart cuál es la ruta correcta.
      const apiUrl = `https://api-codart.cgrt.org/api/dni/${dni}`; 

      console.log(`🔍 [RENIEC] Consultando DNI: ${dni}`);

      const res = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // O como lo pida la API (puede ser 'x-api-key' o similar)
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        return msg.reply(`❌ Error en la API (Código: ${res.status}). Verifica tu token o la URL.`);
      }

      const json = await res.json();
      
      // ⚠️ Ajusta esto según cómo te devuelva los datos la API de Codart
      if (!json.success || !json.data) {
        return msg.reply('❌ No se encontró información para ese DNI.');
      }

      const data = json.data;
      const mensaje = `🪪 *CONSULTA RENIEC*

> 👤 *Nombres:* ${data.nombres}
> 👤 *Apellidos:* ${data.apellidoPaterno} ${data.apellidoMaterno}
> 🆔 *DNI:* ${data.dni}

> 🔒 _Consulta realizada de forma segura_`;

      await sock.sendMessage(msg.chat, { text: mensaje }, { quoted: msg });

    } catch (e) {
      console.error("❌ [DNI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al conectar con la API.');
    }
  }
};
