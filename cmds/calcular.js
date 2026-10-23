import db from "#db"

export default {
  command: ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituto', 'prostituta', 'sinpoto', 'sintetas', 'chipi'],
  category: 'fun',
  botAdmin: false,
  run: async ({ msg, sock, command }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      // ✅ Detectar usuario (mencionado o citado)
      let user = null;
      if (msg.mentionedJid && msg.mentionedJid.length > 0) {
        user = msg.mentionedJid[0];
      } else if (msg.quoted && msg.quoted.sender) {
        user = msg.quoted.sender;
      }

      if (!user) {
        return msg.reply('*🤓 Menciona o responde a un usuario.*');
      }

      const taguser = `@${user.split('@')[0]}`;
      const percentage = Math.floor(Math.random() * 501);

      const emojis = {
        gay: '🏳️‍🌈', lesbiana: '🏳️‍🌈', pajero: '😏💦', pajera: '😏💦', puto: '🔥🥵',
        puta: '🔥🥵', manco: '🎮💀', manca: '🎮💀', rata: '🐁🧀', prostituto: '🫦💋',
        prostituta: '🫦💋', sinpoto: '😂', sintetas: '😿', chipi: '😹🫵🏻'
      };

      const descriptions = {
        gay: [
          "💙 Parece que solo te gusta un poco la fiesta arcoíris.",
          "🖤 Tú no eres amigo... ¡Tú eres amigue! 💀",
          "💜 ¡Nivel DIOS! Ya ni necesitas salir del clóset, lo rompiste amige."
        ],
        lesbiana: [
          "👻 Tal vez un par de maratones de series lésbicas ayuden.",
          "💗 No necesitas confirmación, ya lo sabíamos.",
          "❣️ ¡Tu amor por las chicas es más fuerte que un ship de anime!"
        ],
        pajero: [
          "🧡 Relájate, el internet no se va a acabar.",
          "💞 Bueno, al menos te ejercitas un brazo...",
          "💕 ¡Tus manos ya deberían estar aseguradas como patrimonio nacional!"
        ],
        pajera: [
          "🧡 Relájate, el internet no se va a acabar.",
          "💞 Bueno, al menos te ejercitas un brazo...",
          "💕 ¡Tus manos ya deberían estar aseguradas como patrimonio nacional!"
        ],
        puto: [
          "😼 Tranqui, no todos nacen con el talento.",
          "😺 Si sigues así, te harán monumento en Tinder.",
          "😻 ¡Ya ni el Diablo puede competir contigo!"
        ],
        puta: [
          "😼 Tranqui, no todos nacen con el talento.",
          "😺 Si sigues así, te dejarán más abierta que las puertas del cielo vv.",
          "😻 ¡Más información a su privado, uff mi amor!"
        ],
        manco: [
          "🎮 ¿Seguro que no juegas con los pies?",
          "🥷 ¡Cuidado! Hasta los bots juegan mejor que tú.",
          "💀 Récord mundial en fallar tiros... ¡Sin balas!"
        ],
        manca: [
          "🎮 ¿Por qué eres así? Re mala.",
          "🥷 Anda a la cocina mejor, no servís pa' jugar.",
          "💀 Récord mundial en fallar tiros... ¡Sin balas!"
        ],
        rata: [
          "🐁 Te falta robar un poco más, sigue practicando.",
          "😂 Roba peor que el Real Madrid el puto este.",
          "💖 ¡Eres más rata que Remy de Ratatouille!"
        ],
        prostituto: [
          "🗣️ Tranquilo, el mercado siempre necesita talento nuevo.",
          "✨ ¡Tus servicios tienen 5 estrellas en Google!",
          "💖 Eres tan solicitado que ya tienes tarjeta VIP."
        ],
        prostituta: [
          "🙈 Tranquila que te voy a dar tu pingasaurio.",
          "🥵 ¿Lo haces por gusto, verdad?",
          "💖 ¿Cuándo hacemos un trío? Nena"
        ],
        sinpoto: [
          "👀 ¿Seguro que no eres hombre con pelo largo?",
          "😹 Ni con cirugía te levantas ese autoestima.",
          "🙉 Hasta un mosquito hace más bulto que tú."
        ],
        sintetas: [
          "📭 Más vacía que el buzón de alguien sin amigos.",
          "🌚 Da igual si estás de frente o de espalda, no hay diferencia.",
          "🫨 Se supone que la pubertad ayuda, ¿qué pasó contigo?"
        ],
        chipi: [
          "🤡 Lo tuyo no es mini, es edición limitada.",
          "😹 Lo bueno es que los golpes en la entrepierna no te hacen nada.",
          "💀 Dicen que lo importante es cómo se usa, pero en tu caso ni así."
        ]
      };

      if (!descriptions[command]) {
        return msg.reply('*⚠️ Comando inválido.*');
      }

      const emoji = emojis[command] || '';
      let description;
      if (percentage < 150) description = descriptions[command][0];
      else if (percentage > 400) description = descriptions[command][2];
      else description = descriptions[command][1];

      const responses = [
        "El destino lo ha decidido.",
        "Los datos no mienten.",
        "¡Aquí tienes tu certificado oficial!"
      ];
      const finalResponse = responses[Math.floor(Math.random() * responses.length)];

      const cal = `*🤍 CALCULADORA 🤍*

☁️ *Los cálculos han arrojado que ${taguser} es* ${percentage}% *${command} ${emoji}*

*${description}*
> *${finalResponse}*`.trim();

      // ✅ Animación de carga
      const mensajeInicial = await sock.sendMessage(msg.chat, {
        text: '*🤓 ¡Calculando Porcentaje!*',
        mentions: [user]
      }, { quoted: msg });

      const bars = [
        "《 █▒▒▒▒▒▒▒▒▒▒▒》10%",
        "《 ████▒▒▒▒▒▒▒▒》30%",
        "《 ███████▒▒▒▒▒》50%",
        "《 ██████████▒▒》80%",
        "《 ████████████》100%"
      ];

      for (let i = 0; i < bars.length; i++) {
        await new Promise(res => setTimeout(res, 1000));
        
        await sock.sendMessage(msg.chat, {
          text: bars[i],
          edit: mensajeInicial.key
        });
      }

      await sock.sendMessage(msg.chat, {
        text: cal,
        edit: mensajeInicial.key,
        mentions: [user]
      });

    } catch (e) {
      console.error("❌ [CALCULADORA ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al calcular el porcentaje.');
    }
  }
};
