import db from "#db"
import sharp from 'sharp'

const frases = [
  { min: 0, max: 15, texto: 'Cupido vio esto y pidió vacaciones. 😂💔' },
  { min: 16, max: 35, texto: 'Hay amor... pero solo en los sueños. 😭💕' },
  { min: 36, max: 55, texto: 'Podrían ser algo... si alguien se declara. 👀❤️' },
  { min: 56, max: 75, texto: 'Aquí hay química y unos cuantos nervios. 🥰💘' },
  { min: 76, max: 90, texto: '¡Cupido está haciendo horas extra por ustedes! 💖' },
  { min: 91, max: 100, texto: '¡BODA, BODA! Ya elegimos los padrinos. 💍😂' }
];

function escaparXML(texto = '') {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function nombreBonito(nombre = 'Usuario') {
  const limpio = String(nombre).replace(/[\r\n]/g, ' ').trim();
  return [...limpio].slice(0, 22).join('') || 'Usuario';
}

function crearTarjeta(nombre1, nombre2, porcentaje, frase) {
  const n1 = escaparXML(nombreBonito(nombre1));
  const n2 = escaparXML(nombreBonito(nombre2));
  const mensaje = escaparXML(frase);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg"
       width="900" height="600" viewBox="0 0 900 600">
    <defs>
      <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#ff9aaf"/>
        <stop offset="100%" stop-color="#8e44ad"/>
      </linearGradient>
      <linearGradient id="barra" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#ff477e"/>
        <stop offset="100%" stop-color="#ff1744"/>
      </linearGradient>
    </defs>

    <rect width="900" height="600" rx="36" fill="url(#fondo)"/>
    <circle cx="90" cy="95" r="35" fill="#ffffff" opacity=".15"/>
    <circle cx="810" cy="500" r="65" fill="#ffffff" opacity=".13"/>
    <circle cx="790" cy="105" r="20" fill="#ffffff" opacity=".18"/>

    <rect x="35" y="35" width="830" height="530" rx="30"
          fill="#ffffff" opacity=".93"/>

    <text x="450" y="100" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="35"
          font-weight="bold" fill="#d6336c">LOVE MATCH</text>

    <text x="450" y="155" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="32"
          fill="#ff477e">♥</text>

    <text x="450" y="225" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="35"
          font-weight="bold" fill="#63305b">${n1}</text>

    <text x="450" y="280" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="38"
          fill="#e84378">❤️</text>

    <text x="450" y="330" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="35"
          font-weight="bold" fill="#63305b">${n2}</text>

    <text x="450" y="382" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="20"
          fill="#8e557a">COMPATIBILIDAD AMOROSA</text>

    <text x="450" y="435" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="46"
          font-weight="bold" fill="#e84378">${porcentaje}%</text>

    <rect x="170" y="455" width="560" height="18"
          rx="9" fill="#f4dbe6"/>
    <rect x="170" y="455" width="${560 * porcentaje / 100}" height="18"
          rx="9" fill="url(#barra)"/>

    <text x="450" y="510" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="19"
          fill="#63305b">${mensaje}</text>

    <text x="450" y="540" text-anchor="middle"
          font-family="Arial,sans-serif" font-size="13"
          fill="#99758d">Resultado ficticio • Solo por diversión</text>
  </svg>`;

  return Buffer.from(svg);
}

export default {
  command: ['ship', 'amor', 'love'],
  category: 'fun',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      // ✅ 1. Detectar a las dos personas (por mención)
      const menciones = msg.mentionedJid || [];
      const unicas = [...new Set(menciones)];

      if (unicas.length !== 2) {
        return msg.reply(`💘 *¡SHIP!* 💘

> Menciona a dos personas para crear su tarjeta.

*📌 Ejemplo:* \`.ship @persona1 @persona2\``);
      }

      const [id1, id2] = unicas;

      if (id1 === id2) {
        return msg.reply('😂 ¡No puedes emparejar a una persona consigo misma!');
      }

      // ✅ 2. Calcular porcentaje y frase
      const porcentaje = Math.floor(Math.random() * 101);
      const frase = frases.find(f => porcentaje >= f.min && porcentaje <= f.max).texto;

      // ✅ 3. Obtener los nombres reales de los participantes
      let nombres = [id1, id2].map(id => id.split('@')[0].split(':')[0]);

      try {
        const metadata = await sock.groupMetadata(msg.chat);
        const participantes = metadata.participants ?? [];

        nombres = [id1, id2].map((id, i) => {
          const persona = participantes.find(p => p.id === id || p.lid === id);
          return persona?.name || persona?.notify || nombres[i];
        });
      } catch (e) {
        console.log('⚠️ [SHIP] No se pudieron obtener los nombres reales:', e.message);
      }

      // ✅ 4. Crear la imagen
      console.log(`💘 [SHIP] Generando tarjeta para ${nombres[0]} y ${nombres[1]}`);
      
      const svg = crearTarjeta(nombres[0], nombres[1], porcentaje, frase);
      const png = await sharp(svg).png().toBuffer();

      // ✅ 5. Enviar la imagen
      await sock.sendMessage(msg.chat, {
        image: png,
        caption: '💖 ¡Aquí está su tarjeta de pareja ficticia!',
        mentions: unicas
      }, { quoted: msg });

      // ✅ 6. Enviar el texto decorado adicional
      await sock.sendMessage(msg.chat, {
        text: `💘 *LOVE MATCH* 💘\n\n` +
              `🥰 @${id1.split('@')[0]} ❤️ @${id2.split('@')[0]}\n\n` +
              `💞 Compatibilidad: *${porcentaje}%*\n` +
              `${frase}\n\n` +
              `_⚠️ Resultado aleatorio, solo por diversión._`,
        mentions: unicas
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [SHIP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al crear la tarjeta. Inténtalo de nuevo.');
    }
  }
};
