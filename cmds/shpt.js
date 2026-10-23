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

// Imagen por defecto si el usuario no tiene foto
const FOTO_DEFECTO = 'https://i.pinimg.com/736x/8f/c2/85/8fc285f8b5d0bf7fb8f8e9d4f2b5e3a1.jpg'; 

function escaparXML(texto = '') {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Función para hacer la foto redonda
async function fotoRedonda(url) {
  try {
    let res = await fetch(url);
    if (!res.ok) throw new Error();
    let buffer = Buffer.from(await res.arrayBuffer());
    
    return await sharp(buffer)
      .resize(250, 250)
      .composite([{
        input: Buffer.from(`<svg><circle cx="125" cy="125" r="125" /></svg>`),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
  } catch (e) {
    // Si falla, usamos una foto por defecto
    let res = await fetch(FOTO_DEFECTO);
    let buffer = Buffer.from(await res.arrayBuffer());
    return await sharp(buffer)
      .resize(250, 250)
      .composite([{
        input: Buffer.from(`<svg><circle cx="125" cy="125" r="125" /></svg>`),
        blend: 'dest-in'
      }])
      .png()
      .toBuffer();
  }
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

      // ✅ Obtener nombres reales
      let nombres = [id1, id2].map(id => id.split('@')[0]);
      try {
        const metadata = await sock.groupMetadata(msg.chat);
        const participantes = metadata.participants ?? [];
        nombres = [id1, id2].map((id, i) => {
          const persona = participantes.find(p => p.id === id || p.lid === id);
          return persona?.name || persona?.notify || nombres[i];
        });
      } catch (e) {}

      console.log(`💘 [SHIP] Descargando fotos de perfil...`);

      // ✅ Obtener fotos de perfil
      let foto1, foto2;
      try {
        let url1 = await sock.profilePictureUrl(id1, 'image');
        foto1 = await fotoRedonda(url1);
      } catch (e) {
        let res = await fetch(FOTO_DEFECTO);
        foto1 = await fotoRedonda(FOTO_DEFECTO);
      }

      try {
        let url2 = await sock.profilePictureUrl(id2, 'image');
        foto2 = await fotoRedonda(url2);
      } catch (e) {
        foto2 = await fotoRedonda(FOTO_DEFECTO);
      }

      console.log(`💘 [SHIP] Generando tarjeta...`);

      // ✅ Creamos el fondo rosa con corazones y textos
      const svgFondo = `
      <svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
        <!-- Fondo rosa -->
        <rect width="900" height="600" fill="#ffb3c6" />
        
        <!-- Corazones decorativos en el fondo -->
        <g fill="#ff809f" opacity="0.4">
            <text x="100" y="100" font-size="40">❤️</text>
            <text x="800" y="150" font-size="30">❤️</text>
            <text x="150" y="500" font-size="35">❤️</text>
            <text x="750" y="450" font-size="45">❤️</text>
            <text x="450" y="50" font-size="25">❤️</text>
            <text x="50" y="300" font-size="20">❤️</text>
            <text x="850" y="300" font-size="20">❤️</text>
        </g>

        <!-- Título -->
        <text x="450" y="80" text-anchor="middle" font-family="Arial" font-size="45" font-weight="bold" fill="#d6336c">LOVE MATCH</text>

        <!-- Corazón gigante en el centro -->
        <text x="450" y="330" text-anchor="middle" font-family="Arial" font-size="120" fill="#ff1744">❤️</text>

        <!-- Porcentaje -->
        <text x="450" y="450" text-anchor="middle" font-family="Arial" font-size="65" font-weight="bold" fill="#ffffff">${porcentaje}%</text>

        <!-- Nombres -->
        <text x="200" y="550" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#63305b">${escaparXML(nombres[0])}</text>
        <text x="700" y="550" text-anchor="middle" font-family="Arial" font-size="28" font-weight="bold" fill="#63305b">${escaparXML(nombres[1])}</text>

        <!-- Frase -->
        <text x="450" y="580" text-anchor="middle" font-family="Arial" font-size="18" fill="#8e557a">${escaparXML(frase)}</text>
      </svg>`;

      // ✅ Combinamos todo: Fondo rosa + Foto 1 + Foto 2
      const imagenFinal = await sharp(Buffer.from(svgFondo))
        .composite([
          { input: foto1, top: 150, left: 75 },   // Foto izquierda
          { input: foto2, top: 150, left: 575 }   // Foto derecha
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
      msg.reply('❌ Ocurrió un error al crear la tarjeta. Asegúrate de que los usuarios tengan foto de perfil.');
    }
  }
};
