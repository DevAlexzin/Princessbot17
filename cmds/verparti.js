import db from "#db"

export default {
  command: ['verparti', 'listaparti', 'partiver'],
  category: 'grupo',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) {
        return msg.reply('《✤》 Este comando solo funciona en grupos.');
      }

      // 1. Calculamos la semana actual
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      const dbKey = `participacion_semana_${año}_${semana}`;
      const chatData = await db.getChat(msg.chat);
      const registros = chatData[dbKey] || [];

      if (registros.length === 0) {
        return msg.reply('⚠️ *No hay participaciones anotadas esta semana.*\n\n> Usa `.parti Nombre 💙` para anotarte.');
      }

      // 2. Construimos la lista con el diseño que pediste
      let listaParticipantes = '';
      for (const reg of registros) {
        const corazones = reg.corazones.length > 0
          ? reg.corazones.join(' ')
          : '⏳';

        listaParticipantes += `ᯓ★ .ᐟ ${reg.nombre} ║ ${corazones}\n`;
      }

      const participacionMsg = `ˑ 𓈒 𐔌 🫐𝗣𝗮𝗿𝘁𝗶𝗰𝗶𝗽𝗮𝗰𝗶𝗼𝗻 𝘀𝗲𝗺𝗮𝗻𝗮𝗹  ͡꒱ ۫

⊹₊˚‧︵‿₊୨ 𝐵𝑜𝑟𝑛 𝑡𝑜 𝑑𝑖𝑒. ୧₊‿︵‧˚₊⊹

 Mvρ: 👑
 Pᥲrtιᥴιρᥲᥴιoᥒ :
𝗟💙/𝗠🌊/𝗠🫐/𝗝🪽/𝗩🌀/𝗦✨

⌢.⌢.⌢.꒰⌢୨୧⌢꒱.⌢.⌢.⌢

𑣲⋆࣪ ִֶָ 𝙄𝙉𝙏𝙀𝙂𝙍𝘼𝙉𝙏𝙀𝙎 
${listaParticipantes}
> *Total:* ${registros.length}`;

      // 3. Enviamos el mensaje
      await sock.sendMessage(msg.chat, { text: participacionMsg.trim() }, { quoted: msg });

    } catch (e) {
      console.error("❌ [VERPARTI ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al mostrar la lista.');
    }
  },
};
