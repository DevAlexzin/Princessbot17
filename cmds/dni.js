import db from "#db"
import fetch from 'node-fetch"

export default {
  command: ['dni', 'reniec'],
  category: 'tools',
  botAdmin: false,
  run: async ({ msg, sock, args }) => {
    try {
      // 1. Validar el DNI
      const dni = args[0];
      if (!dni || !/^\d{8}$/.test(dni)) {
        return msg.reply('❌ Debes ingresar un DNI válido de 8 dígitos.\n\n*Ejemplo:* `.dni 12345678`');
      }

      // 2. Configurar Token y URL
      // ⚠️ REEMPLAZA ESTO CON TU NUEVO TOKEN Y LA RUTA EXACTA
      const token = '3PTHRsi2QxhKDHrcwu2izm1p0iLRIUrXk2uR5SknsmneA31K8W3LHmKThsba'; 
      const apiUrl = `https://api-codart.cgrt.org/RUTA_EXACTA/${dni}`; 

      console.log(`🔍 [RENIEC] Consultando DNI: ${dni} en ${apiUrl}`);

      // 3. Hacer la petición a la API
      const res = await fetch(apiUrl, {
        method: 'GET', // Cambia a 'POST' si la documentación lo requiere
        headers: {
          'Authorization': `Bearer ${token}`, // Algunas APIs usan 'x-api-key' en vez de Authorization
          'Content-Type': 'application/json'
        }
      });

      // 4. Manejar errores HTTP (404, 401, etc.)
      if (!res.ok) {
        return msg.reply(`❌ Error en la API (Código: ${res.status}).\n\n> Verifica que la URL y el Token sean correctos.`);
      }

      // 5. Leer la respuesta
      const json = await res.json();
      
      // 6. Adaptar según la respuesta de Codart
      // (A veces la data viene directo en json, a veces en json.data)
      const data = json.data || json; 
      
      if (!data.nombres) {
        return msg.reply('❌ No se encontró información para ese DNI. Revisa el formato de respuesta de la API.');
      }

      // 7. Armar el mensaje
      const mensaje = `🪪 *CONSULTA RENIEC*

> 👤 *Nombres:* ${data.nombres}
> 👤 *Apellidos:* ${data.apellidoPaterno || ''} ${data.apellidoMaterno || ''}
> 🆔 *DNI:* ${data.dni || dni}

> 🔒 _Consulta realizada de forma segura_`;

      await sock.sendMessage(msg.chat, { text: mensaje }, { quoted: msg });

    } catch (e) {
      console.error("❌ [DNI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al conectar con la API.');
    }
  }
};
