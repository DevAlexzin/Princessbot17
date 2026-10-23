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

function escaparXML(texto = '') {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function generarAvatar(nombre, color) {
  const inicial = nombre ? nombre.charAt(0).toUpperCase() : '?';
  const svg = `
    <svg width="250" height="250" xmlns="http://www.w3.org/2000/svg">
      <circle cx="125" cy="125" r="125" fill="${color}" />
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="100" fill="#ffffff" font-weight="bold">${escaparXML(inicial)}</text>
    </svg>`;
  return await sharp(Buffer.from(svg)).png().toBuffer();
}

async function procesarFoto(url) {
  try {
    if (!url) return null;
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width) return null;
    return await sharp(buffer)
      .resize(250, 250)
      .composite([{ input: Buffer.from(`<svg><circle cx="125" cy="125" r="125" /></svg>`), blend: 'dest-in' }])
      .png()
      .toBuffer();
  } catch (e) { return null; }
}

export default {
  command: ['ship', 'amor', 'love'],
  category: 'fun',
  botAdmin: false,
  run: async ({ msg, sock, text }) => {
    try {
      if (!msg.isGroup) return msg.reply('《✤》 Este comando solo funciona en grupos.');

      const menciones = msg.mentionedJid || [];
      const unicas = [...new Set(menciones)];

      if (unicas.length !== 2) {
        return msg.reply(`💘 *¡SHIP!* 💘\n\n> Menciona a dos personas para crear su tarjeta.\n\n*📌 Ejemplo:* \`.ship @persona1 @persona2 Nombre1 Nombre2\``);
      }

      const [id1, id2] = unicas;
      if (id1 === id2) return msg.reply('😂 ¡No puedes emparejar a una persona consigo misma!');

      const porcentaje = Math.floor(Math.random() * 101);
      const frase = frases.find(f => porcentaje >= f.min && porcentaje <= f.max).texto;

      // ✅ DETECCIÓN DE NOMBRES MANUALES
      // Si el usuario escribe ".ship @Rocio @Emy Rocio Emy", los nombres están en el texto
      let nombresManuales = [];
      
      // Limpiamos el texto de las menciones y comandos
      let textoLimpio = (text || '').replace(/@\d{8,15}/g, '').trim();
      // Si quedan palabras, las usamos como nombres
      if (textoLimpio) {
        nombresManuales = textoLimpio.split(' ').filter(p => p.length > 0);
      }

      let nombres = [];
      
      for (let i = 0; i < unicas.length; i++) {
        let nombreFinal = null;

        // 1. Si el usuario escribió el nombre manualmente, lo usamos
        if (nombresManuales[i]) {
          nombreFinal = nombresManuales[i];
        }

        // 2. Si no, usamos el número como último recurso
        if (!nombreFinal) {
          nombreFinal = unicas[i].split('@')[0].split(':')[0];
        }

        nombres.push(nombreFinal.substring(0, 20));
      }

      console.log(`💘 [SHIP] Nombres: "${nombres[0]}" y "${nombres[1]}"`);

      // ✅ FOTOS
      let foto1 = null, foto2 = null;
      try {
        const url1 = await sock.profilePictureUrl(id1, 'image');
        foto1 = await procesarFoto(url1);
      } catch (e) {}
      try {
        const url2 = await sock.profilePictureUrl(id2, 'image');
        foto2 = await procesarFoto(url2);
      } catch (e) {}

      if (!foto1) foto1 = await generarAvatar(nombres[0], '#ff477e');
      if (!foto2) foto2 = await generarAvatar(nombres[1], '#8e44ad');

      // ✅ IMAGEN FINAL
      const svgFondo = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
        <rect width="900" height="600" fill="#ffb3c6" />
        <g fill="#ff809f" opacity="0.4">
            <text x="100" y="100" font-size="40">❤️</text>
            <text x="800" y="150" font-size="30">❤️</text>
            <text x="150" y="500" font-size="35">❤️</text>
            <text x="750" y="450" font-size="45">❤️</text>
            <text x="450" y="50" font-size="25">❤️</text>
        </g>
        <text x="450" y="80" text-anchor="middle" font-family="Arial" font-size="45" font-weight="bold" fill="#d6336c">LOVE MATCH</text>
        <text x="450" y="330" text-anchor="middle" font-family="Arial" font-size="120" fill="#ff1744">❤️</text>
        <text x="450" y="450" text-anchor="middle" font-family="Arial" font-size="65" font-weight="bold" fill="#ffffff">${porcentaje}%</text>
        <text x="200" y="550" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#63305b">${escaparXML(nombres[0])}</text>
        <text x="700" y="550" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#63305b">${escaparXML(nombres[1])}</text>
        <text x="450" y="580" text-anchor="middle" font-family="Arial" font-size="18" fill="#8e557a">${escaparXML(frase)}</text>
      </svg>`;

      const imagenFinal = await sharp(Buffer.from(svgFondo))
        .composite([
          { input: foto1, top: 150, left: 75 },
          { input: foto2, top: 150, left: 575 }
        ])
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
