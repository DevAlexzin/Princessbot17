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

      // ✅ Pega aquí el NUEVO token
      const token = '3PTHRsi2QxhKDHrcwu2izm1p0iLRIUrXk2uR5SknsmneA31K8W3LHmKThsba'; 
      
      // ✅ Pega aquí la URL EXACTA de la documentación de Codart
      const apiUrl = `https://api-codart.cgrt.org/LA_RUTA_QUE_TE_DEN'; 

      console.log(`🔍 [RENIEC] Consultando DNI: ${dni} en ${apiUrl}`);

      // ✅ Si la API pide POST, cambia el método y envía el DNI en el body
      const res = await fetch(apiUrl, {
        method: 'POST', // o 'GET' según la documentación
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ dni: dni }) // Si es GET, borra esta línea
      });

      if (!res.ok) {
        return msg.reply(`❌ Error en la API (Código: ${res.status}). Verifica tu token o la URL.`);
      }

      const json = await res.json();
      
      // ⚠️ Ajusta esto según cómo devuelva los datos la API de Codart
      const data = json.data || json; 
      
      if (!data.nombres) {
        return msg.reply('❌ No se encontró información para ese DNI.');
      }

      const mensaje = `🪪 *CONSULTA RENIEC*

> 👤 *Nombres:* ${data.nombres}
> 👤 *Apellidos:* ${data.apellidoPaterno} ${data.apellidoMaterno}
> 🆔 *DNI:* ${data.dni || dni}

> 🔒 _Consulta realizada de forma segura_`;

      await sock.sendMessage(msg.chat, { text: mensaje }, { quoted: msg });

    } catch (e) {
      console.error("❌ [DNI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al conectar con la API.');
    }
  }
};
