import db from "#db"
import fs from 'fs'
import path from 'path'
import { downloadContentFromMessage } from 'baileys'

export default {
  command: ['anuncio', 'broadcast'],
  category: 'owner',
  isOwner: true, // ✅ Solo el dueño puede usarlo
  botAdmin: false,
  run: async ({ msg, sock, args, text }) => {
    try {
      // 1. Verificamos si hay texto
      const mensajeTexto = text || args.join(' ').trim();
      
      // 2. Verificamos si hay imagen adjunta (en el mensaje actual o citado)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const tieneImagenActual = msg.message?.imageMessage;
      const tieneImagenCitada = quoted?.imageMessage;
      const tieneImagen = tieneImagenActual || tieneImagenCitada;

      if (!mensajeTexto && !tieneImagen) {
        return msg.reply(`📢 *Enviar Anuncio a Grupos*

*📋 Opciones:*
> \`.anuncio [Mensaje]\` (Solo texto)
> \`.anuncio\` (respondiendo a una imagen) (Solo imagen)
> \`.anuncio [Mensaje]\` (respondiendo a una imagen) (Imagen con texto)

*📌 Ejemplo:* \`.anuncio El bot estará en mantenimiento\``);
      }

      let mediaBuffer = null;
      let mediaType = null;

      // 3. Si hay imagen, la descargamos
      if (tieneImagen) {
        console.log(`📸 [ANUNCIO] Descargando imagen...`);
        const mensajeImagen = tieneImagenActual || tieneImagenCitada;
        
        try {
          const stream = await downloadContentFromMessage(mensajeImagen, 'image');
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          mediaBuffer = buffer;
          mediaType = 'image';
          console.log(`✅ [ANUNCIO] Imagen descargada (${mediaBuffer.length} bytes)`);
        } catch (err) {
          console.error(`❌ [ANUNCIO] Error al descargar la imagen:`, err.message);
          return msg.reply('❌ No se pudo descargar la imagen para el anuncio.');
        }
      }

      console.log(`📢 [ANUNCIO] Iniciando envío a todos los grupos...`);

      // 4. Obtenemos todos los chats
      const todosLosChats = await db.getChat();
      let enviados = 0;
      let fallidos = 0;

      // 5. Recorremos los chats y enviamos solo a grupos
      for (const chatData of todosLosChats) {
        if (chatData.id && chatData.id.endsWith('@g.us')) {
          try {
            let opcionesEnvio = {};

            if (mediaBuffer) {
              // ✅ Si hay imagen, la enviamos con el texto como caption
              opcionesEnvio = {
                image: mediaBuffer,
                caption: mensajeTexto ? `📢 *ANUNCIO OFICIAL*\n\n${mensajeTexto}\n\n> _Mensaje automático del bot_` : ''
              };
            } else {
              // ✅ Si solo hay texto
              opcionesEnvio = {
                text: `📢 *ANUNCIO OFICIAL*\n\n${mensajeTexto}\n\n> _Mensaje automático del bot_`
              };
            }

            await sock.sendMessage(chatData.id, opcionesEnvio);
            enviados++;
            console.log(`✅ [ANUNCIO] Enviado a: ${chatData.id}`);
            
            // Pausa de 1.5 segundos entre grupos para no saturar
            await new Promise(r => setTimeout(r, 1500));
            
          } catch (err) {
            fallidos++;
            console.error(`❌ [ANUNCIO] Error al enviar a ${chatData.id}:`, err.message);
          }
        }
      }

      // 6. Confirmamos al owner
      await msg.reply(`✅ *Anuncio enviado*\n\n> 📊 *Grupos exitosos:* ${enviados}\n> ❌ *Grupos fallidos:* ${fallidos}`);

    } catch (e) {
      console.error("❌ [ANUNCIO ERROR CRÍTICO]:", e.message);
      msg.reply('❌ Ocurrió un error al enviar el anuncio.');
    }
  }
};
