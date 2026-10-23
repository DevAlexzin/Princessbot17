import db from "#db"

export default {
  command: ['patro', 'patrocinio'],
  category: 'grupo',
  isAdmin: true,
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      let textoCompleto = msg.text || msg.body || '';
      const texto = textoCompleto
        .replace(/^[.\/!#]?(patro|patrocinio)\s*/i, '')
        .trim();

      if (!texto) {
        return msg.reply(`🏹 *Registrar Patrocinio*

*📋 Formato:*
\`.patro Nombre/Valor/Número/Banners/Pack/Banner Oficial\`

*📌 Ejemplo:*
\`.patro valkirie/3500$/+5429173728/banners inv vip/banners patro ofc/rooster\``);
      }

      const partes = texto.split('/').map(p => p.trim());

      if (partes.length < 6) {
        return msg.reply('❌ *Faltan datos.*\n\nDebes separar 6 valores con `/`:\n`Nombre/Valor/Número/Banners/Pack/Banner Oficial`');
      }

      const [nombre, valor, numero, banners, pack, bannerOficial] = partes;

      // ✅ Guardamos el patrocinio en la DB con estado "pendiente"
      const chatData = await db.getChat(msg.chat);
      const dbKey = `patrocinios_${msg.chat}`;
      let patrocinios = chatData[dbKey] || [];
      
      const idPatro = Date.now().toString();
      patrocinios.push({
        id: idPatro,
        nombre,
        valor,
        numero,
        banners,
        pack,
        bannerOficial,
        estado: 'pendiente',
        fecha: new Date().toISOString()
      });
      
      await db.updateChat(msg.chat, dbKey, patrocinios);

      const patroMsg = `ꔛㅤׅ 🏹 𝗣𝗮𝘁𝗿𝗼
ㅤ    ㅤ╰ ▸ › ${bannerOficial}

ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

.₊ ᵎᵎ 𖤓 🍒 𝓥𝓪𝓵𝓸𝓻
ㅤ    ㅤ╰ ▸ › ${valor}

᭝ ᨳଓ ՟ 🌈 𝓝𝓾𝓶𝓮𝓻𝓸
ㅤ    ㅤ╰ ▸ › ${numero}

ु   ᜊ 🪩 𝓑𝓪𝓷𝓷𝓮𝓻𝓼
╴ᨳ ⸝⸝ ${banners}

 ┈─˖Ი𐑼⋆ 𝓔𝓷𝓽𝓻𝓮𝓰𝓪𝓭𝓸

> 📌 Estado: *Pendiente*`;

      // ✅ Enviamos el mensaje CON el botón
      await sock.sendMessage(msg.chat, {
        text: patroMsg.trim(),
        footer: 'Princess Bot',
        buttons: [
          { 
            buttonId: `patro_entre_${idPatro}`, 
            buttonText: { displayText: '✅ Marcar como Entregado' }, 
            type: 1 
          }
        ],
        headerType: 1
      }, { quoted: msg });

      console.log(`✅ [PATRO] Patrocinio ${idPatro} creado.`);

    } catch (e) {
      console.error("❌ [PATRO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al registrar el patrocinio.');
    }
  }
};
