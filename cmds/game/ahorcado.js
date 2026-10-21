import db from "#db"

const palabras = [
    "gato", "perro", "pajaro", "elefante", "tigre", "ballena", "mariposa",
    "tortuga", "conejo", "rana", "pulpo", "ardilla", "jirafa", "cocodrilo",
    "pinguino", "delfin", "serpiente", "hamster", "mosquito", "abeja",
    "television", "computadora", "botsito", "reggaeton",
    "economia", "electronica", "facebook", "whatsapp", "instagram", "tiktok",
    "milanesa", "presidente", "bot", "peliculas"
];

const intentosMaximos = 6;

export function normalizar(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function ocultarPalabra(palabra, letrasAdivinadas) {
    let salida = "";
    for (const letra of palabra) {
        salida += letrasAdivinadas.includes(letra) ? letra + " " : "_ ";
    }
    return salida.trim();
}

export function mostrarAhorcado(intentos) {
    const estados = [
` ____ \n |  |\n |  O\n | /|\\\n_|_`,
` ____ \n |  |\n |  O\n | /|\\\n |`,
` ____ \n |  |\n |  O\n | /|\n |`,
` ____ \n |  |\n |  O\n | /\n |`,
` ____ \n |  |\n |  O\n |\n |`,
` ____ \n |  |\n |\n |\n |`
    ];
    return estados[intentosMaximos - intentos];
}

export default {
  command: ['ahorcado'],
  category: 'game',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      const sender = msg.sender;

      if (global.ahorcado?.[sender]) {
        return msg.reply("⚠️ Ya tienes un juego en curso. Termínalo antes de iniciar otro.");
      }

      const palabra = palabras[Math.floor(Math.random() * palabras.length)].toLowerCase();
      const letrasAdivinadas = [];
      const intentos = intentosMaximos;
      const mensaje = ocultarPalabra(palabra, letrasAdivinadas);

      global.ahorcado = global.ahorcado || {};
      global.ahorcado[sender] = { palabra, letrasAdivinadas, intentos };

      await sock.sendMessage(msg.chat, {
        text: `🎮 *JUEGO DEL AHORCADO*\n\nAdivina la palabra:\n\n${mensaje}\n\nIntentos: ${intentos}\n\n💡 Envía una *letra* para jugar.\n\n> solo cuentan los intentos de quién usó el comando.`
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [AHORCADO ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al iniciar el juego.');
    }
  },
};
