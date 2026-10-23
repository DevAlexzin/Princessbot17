import db from "#db"
import sharp from 'sharp'
import fetch from 'node-fetch'

const frases = [
  { min: 0, max: 15, texto: 'Cupido vio esto y pidió vacaciones. 😂💔' },
  { min: 16, max: 35, texto: 'Hay amor... pero solo en los sueños. 😭💕' },
  { min: 36, max: 55, texto: 'Podrían ser algo... si alguien se declara. 👀❤️' },
  { min: 56, max: 75, texto: 'Aquí hay química y unos cuantos nervios. 🥰💘' },
  { min: 76, max: 90, texto: '¡Cupido está haciendo horas extra por ustedes! 💖' },
  { min: 91, max: 100, texto: '¡BODA, BODA! Ya elegimos los padrinos. 💍😂' }
];

// URL de la imagen de fondo (niños abrazados)
const IMAGEN_FONDO = 'https://i.imgur.com/8Y4w5kL.png'; 

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

export default {
  command: ['ship', 'amor', 'love'],
  category: 'fun',
  botAdmin: false,
  run: async ({ msg, sock }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      const menciones = msg.mentionedJid || [];
      const unicas = [...new Set(menciones)];

      if (unicas.length !== 2) {
        return msg.reply(`💘 *¡SHIP!* 💘

> Menciona a dos personas para crear su tarjeta.

*📌 Ejemplo:* \`.ship @persona1 @persona2\``);
      }

      const [id1, id2] = unicas;
      if (id1 === id2) return msg.reply('😂 ¡No puedes emparejar a una persona consigo misma!');

      const porcentaje = Math.floor(Math.random() * 101);
      const frase = frases.find(f => porcentaje >= f.min && porcentaje <= f.max).texto;

      let nombres = [id1, id2].map(id => id.split('@')[0]);
      
      try {
        const metadata = await sock.groupMetadata(msg.chat);
        const participantes = metadata.participants ?? [];
        nombres = [id1, id2].map((id, i) => {
          const persona = participantes.find(p => p.id === id || p.lid === id);
          return persona?.name || persona?.notify || nombres[i];
        });
      } catch (e) {}

      console.log(`💘 [SHIP] Generando tarjeta con imagen de fondo...`);

      // ✅ 1. Descargamos la imagen de fondo
      const resImagen = await fetch(IMAGEN_FONDO);
      const bufferFondo = Buffer.from(await resImagen.arrayBuffer());

      // ✅ 2. Creamos el SVG con los textos (transparente para que se vea el fondo)
      const svgTextos = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
        <!-- Fondo semitransparente para que el texto se lea -->
        <rect width="900" height="600" fill="rgba(0,0,0,0.5)" />
        
        <text x="450" y="100" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#ff477e">LOVE MATCH</text>
        
        <text x="450" y="200" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#ffffff">${escaparXML(nombreBonito(nombres[0]))}</text>
        
        <text x="450" y="270" text-anchor="middle" font-family="Arial" font-size="50" fill="#ff1744">❤️</text>
        
        <text x="450" y="340" text-anchor="middle" font-family="Arial" font-size="40" font-weight="bold" fill="#ffffff">${escaparXML(nombreBonito(nombres[1]))}</text>
        
        <text x="450" y="420" text-anchor="middle" font-family="Arial" font-size="60" font-weight="bold" fill="#ffb3c6">${porcentaje}%</text>
        
        <text x="450" y="520" text-anchor="middle" font-family="Arial" font-size="22" fill="#ffffff">${escaparXML(frase)}</text>
      </svg>`;

      // ✅ 3. Combinamos la imagen de fondo con los textos
      const imagenFinal = await sharp(bufferFondo)
        .composite([{ input: Buffer.from(svgTextos), top: 0, left: 0 }])
        .png()
        .toBuffer();

      await sock.sendMessage(msg.chat, {
        image: imagenFinal,
        caption: '💖 ¡Aquí está su tarjeta de pareja ficticia!',
        mentions: unicas
      }, { quoted: msg });

    } catch (e) {
      console.error("❌ [SHIP ERROR]:", e.message);
      msg.reply('❌ Ocurrió un error al crear la tarjeta.');
    }
  }
};
