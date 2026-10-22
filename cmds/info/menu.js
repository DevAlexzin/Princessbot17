import db from "#db";
import fs from 'fs';
import path from 'path';
import { linksPreview } from '#serialize';

const menuImagePath = path.join(process.cwd(), 'menu.jpeg');

export default {
  command: ['allmenu', 'help', 'menu'],
  category: 'info',
  run: async ({ msg, sock }) => {
    try {
      const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net' || '';
      if (!botId) return msg.reply('❌ Error: No se pudo obtener el ID del bot.');

      const botSettings = await db.getSettings(botId);
      const botname = botSettings.namebot || 'Lovely Bot';
      const botname2 = botSettings.namebot2 || 'Lovely';
      const banner = botSettings.banner || '';
      const link = 'https://wa.me/+5491172630652';

      // ✅ MENÚ COMPLETO (texto exacto que proporcionaste)
      const menu = `┈─˖Ი𐑼⋆ ᨰꫀᥣᥴ᥆ꩇꫀ Aᥒgᥱᥣιᥴ ρrιᥒᥴᥱss 

᭝ ᨳଓ ՟ 🏹 𝗛𝗼𝗹𝗶 ${taguser} 𝘀𝗼𝘆 𝗣𝗿𝗶𝗻𝗰𝗲𝘀𝘀 𝗕𝗼𝘁 , ${saludo} 

˙ . ꒷ 🪄 Qᥙᥱ tᥱᥒgᥲs ᥙᥒ ᥣιᥒdo dιᥲ 

૮︵⭒‿⭒︵⭒‿᧔☪︎᧓‿⋆︵⋆‿⋆︵౨

╭- ᨳ꒰ ˖.𖥔 ݁ ˖. 𝑪𝒓𝒆𝒂𝒅𝒐𝒓! ⊹ ࣪ ˖ ᨐฅ 
│🌈 𝐂𝐫𝐞𝐚𝐝𝐨𝐫: 𝓡𝓸𝓼𝓮𝓮
│🌈 𝐃𝐞𝐯𝐞𝐥𝐨𝐩𝐞𝐫: 𝓞𝓬𝓾𝓵𝓽𝓸 
╰- ᨳ꒰ 𖡼.𖤣𖥧𖡼.𖤣𖥧𖡼.𖤣𖥧𖡼.𖤣𖥧𖡼.𖤣𖥧𖡼

⌢ . ⌢ . ⌢꒰ ⌢ ᨳଓ ⌢ ꒱⌢ . ⌢ . ⌢ .
     
 ᰭ ꔛㅤׅ🎠 𝘾𝙤𝙢𝙖𝙣𝙙𝙤𝙨 𝙋𝙧𝙞𝙣𝙘𝙚𝙨𝙨

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु

ᨳ՞҂ Jᥙᥱgos ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌈 .ahorcado
> ╴ᨳ ⸝⸝ Juego de ahorcado 

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Frᥱᥱ fιrᥱ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🍒 .parti
> ╴ᨳ ⸝⸝ Lista de participacion
𐔌🍒 .partidel
> ╴ᨳ ⸝⸝ Borrar lista de participacion
𐔌🍒 .mvp
> ╴ᨳ ⸝⸝ Poner mvp de versus
𐔌🍒 .compe
> ╴ᨳ ⸝⸝ @ las jugadoras de cada versus
𐔌🍒 .reglas
> ╴ᨳ ⸝⸝ Manda las reglas de cada versus
𐔌🍒 .reglasver
> ╴ᨳ ⸝⸝ Ver las reglas de cada versus
𐔌🍒 .reglasoff
> ╴ᨳ ⸝⸝ Desactivar las reglas
𐔌🍒 .versus┆.vs
> ╴ᨳ ⸝⸝ Lista para versus coordinados
𐔌🍒 .versusganados┆.vg
> ╴ᨳ ⸝⸝ Lista para versus ganados
𐔌🍒 .perfil
> ╴ᨳ ⸝⸝ Perfil de jugadora
𐔌🍒 .delreg
> ╴ᨳ ⸝⸝ Borrar perfil de jugadora
𐔌🍒 .reg + < nombre >
> ╴ᨳ ⸝⸝ Registrar jugadora 
𐔌🍒 .versusg
> ╴ᨳ ⸝⸝ Lista de versus ganados 
𐔌🍒 .vc
> ╴ᨳ ⸝⸝ Lista de versus coordinados
𐔌🍒 .formulario 
> ╴ᨳ ⸝⸝ Formularios de jugadoras
𐔌🍒 .win┆.loss
> ╴ᨳ ⸝⸝ Lista con rivales y veces ganadas y pérdidas 
𐔌🍒 .black 
> ╴ᨳ ⸝⸝ Lista negra de teams

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु    

ᨳ՞҂ Sortᥱos ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🍯 .ganadores 
> ╴ᨳ ⸝⸝ Lista de ganadores 
𐔌🍯 .lunes┆.martes┆.miercoles┆.jueves┆.viernes
> ╴ᨳ ⸝⸝ Lista de dias que sortean las dzn

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Aᥒιmᥱ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🎠𐦯 .peek + < @ >
> ╴ᨳ ⸝⸝ Espiar 
𐔌🎠𐦯 .comfort + < @ >
> ╴ᨳ ⸝⸝ Consolar
𐔌🎠𐦯 .thinkhard + < @ >
> ╴ᨳ ⸝⸝ Pensar intensamente 
𐔌🎠𐦯 .curious + < @ >
> ╴ᨳ ⸝⸝ Sentir curiosidad
𐔌🎠𐦯 .sniff + < @ >
> ╴ᨳ ⸝⸝ Olfatear
𐔌🎠𐦯 .stare + < @ >
> ╴ᨳ ⸝⸝ Mirar fijamente
𐔌🎠𐦯 .trip + < @ >
> ╴ᨳ ⸝⸝ Tropezar 
𐔌🎠𐦯 .blowkiss + < @ >
> ╴ᨳ ⸝⸝ Lanzar un beso 
𐔌🎠𐦯 .snuggle + < @ >
> ╴ᨳ ⸝⸝ Acurrucarse 
𐔌🎠𐦯 .angry + < @ >
> ╴ᨳ ⸝⸝ Enojad@
𐔌🎠𐦯 .bleh + < @ >
> ╴ᨳ ⸝⸝ Sacar la lengua 
𐔌🎠𐦯 .bored┆.aburrido+ < @ >
> ╴ᨳ ⸝⸝ Estar aburrido 
𐔌🎠𐦯 .clap + < @ >
> ╴ᨳ ⸝⸝ Aplaudir
𐔌🎠𐦯 .coffee┆.cafe + < @ >
> ╴ᨳ ⸝⸝ Tomar café
𐔌🎠𐦯 .cold + < @ >
> ╴ᨳ ⸝⸝ Mucho frío 
𐔌🎠𐦯 .sing + < @ >
> ╴ᨳ ⸝⸝ Cantar
𐔌🎠𐦯 .tickle + < @ >
> ╴ᨳ ⸝⸝ Cosquillas 
𐔌🎠𐦯 .scream + < @ >
> ╴ᨳ ⸝⸝ Gritar 
𐔌🎠𐦯 .push + < @ >
> ╴ᨳ ⸝⸝ Empujar 
𐔌🎠𐦯 .nope + < @ >
> ╴ᨳ ⸝⸝ Desacuerdo 
𐔌🎠𐦯 .jump + < @ >
> ╴ᨳ ⸝⸝ Saltar 
𐔌🎠𐦯 .heat + < @ >
> ╴ᨳ ⸝⸝ Sentir calor 
𐔌🎠𐦯 .gaming + < @ >
> ╴ᨳ ⸝⸝ Jugar 
𐔌🎠𐦯 .draw + < @ >
> ╴ᨳ ⸝⸝ Dibujar
𐔌🎠𐦯 .call+ < @ >
> ╴ᨳ ⸝⸝ Llamar
𐔌🎠𐦯 .dramatic┆.drama + < @ >
> ╴ᨳ ⸝⸝ Hacer drama 
𐔌🎠𐦯 .drunk + < @ >
> ╴ᨳ ⸝⸝ Borracho 
𐔌🎠𐦯 .impregnate┆.preg + < @ >
> ╴ᨳ ⸝⸝ Embarazar
𐔌🎠𐦯 .kisscheek┆.beso + < @ >
> ╴ᨳ ⸝⸝ Beso en la mejilla 
𐔌🎠𐦯 .laugh + < @ >
> ╴ᨳ ⸝⸝ Reírse 
𐔌🎠𐦯 .love ┆.amor + < @ >
> ╴ᨳ ⸝⸝ Atracción 
𐔌🎠𐦯 .pout + < @ >
> ╴ᨳ ⸝⸝ Pucheros 
𐔌🎠𐦯 .punch + < @ >
> ╴ᨳ ⸝⸝ Dar una piña
𐔌🎠𐦯 .run ┆.correr + < @ >
> ╴ᨳ ⸝⸝ Correr
𐔌🎠𐦯 .sad┆.triste + < @ >
> ╴ᨳ ⸝⸝ Tristeza 
𐔌🎠𐦯 .scared + < @ >
> ╴ᨳ ⸝⸝ Miedo 
𐔌🎠𐦯 .seduce + < @ >
> ╴ᨳ ⸝⸝ Seducir
𐔌🎠𐦯 .shy ┆.timido + < @ >
> ╴ᨳ ⸝⸝ Timidez 
𐔌🎠𐦯 .sleep + < @ >
> ╴ᨳ ⸝⸝ Dormir
𐔌🎠𐦯 .smoke┆.fumar + < @ >
> ╴ᨳ ⸝⸝ Fumar
𐔌🎠𐦯 .spit┆.escupir + < @ >
> ╴ᨳ ⸝⸝ Escupir 
𐔌🎠𐦯 .step┆.pisar + < @ >
> ╴ᨳ ⸝⸝ Pisar 
𐔌🎠𐦯 .think + < @ >
> ╴ᨳ ⸝⸝ Pensar
𐔌🎠𐦯 .walk + < @ >
> ╴ᨳ ⸝⸝ Caminar
𐔌🎠𐦯 .hug + < @ >
> ╴ᨳ ⸝⸝ Abrazar 
𐔌🎠𐦯 .kill + < @ >
> ╴ᨳ ⸝⸝ Matar
𐔌🎠𐦯 .eat┆.nom┆.comer + < @ >
> ╴ᨳ ⸝⸝ Comer
𐔌🎠𐦯 .kiss┆muak + < @ >
> ╴ᨳ ⸝⸝ Besar 
𐔌🎠𐦯 .wink + < @ >
> ╴ᨳ ⸝⸝ Guiñar 
𐔌🎠𐦯 .pat + < @ >
> ╴ᨳ ⸝⸝ Acariciar 
𐔌🎠𐦯 .happy┆.feliz + < @ >
> ╴ᨳ ⸝⸝ Felicidad
𐔌🎠𐦯 .bully + < @ >
> ╴ᨳ ⸝⸝ Hacer bullying
𐔌🎠𐦯 .bite┆.morder + < @ >
> ╴ᨳ ⸝⸝ Morder
𐔌🎠𐦯 .blush + < @ >
> ╴ᨳ ⸝⸝ Sonrojarse
𐔌🎠𐦯 .wave + < @ >
> ╴ᨳ ⸝⸝ Saludar 
𐔌🎠𐦯 .bath + < @ >
> ╴ᨳ ⸝⸝ Bañarse
𐔌🎠𐦯 .smug + < @ >
> ╴ᨳ ⸝⸝ Presumir 
𐔌🎠𐦯 .smile + < @ >
> ╴ᨳ ⸝⸝ Sonreír 
𐔌🎠𐦯 .highfive + < @ >
> ╴ᨳ ⸝⸝ Chocar los 5
𐔌🎠𐦯 .handhold + < @ >
> ╴ᨳ ⸝⸝ Agarrase de las manos 
𐔌🎠𐦯 .cringe + < @ >
> ╴ᨳ ⸝⸝ Sentir cringe
𐔌🎠𐦯 .bonk + < @ >
> ╴ᨳ ⸝⸝ Pegar 
𐔌🎠𐦯 .cry + < @ >
> ╴ᨳ ⸝⸝ Llorar
𐔌🎠𐦯 .lick + < @ >
> ╴ᨳ ⸝⸝ Chupar
𐔌🎠𐦯 .slap + < @ >
> ╴ᨳ ⸝⸝ Cachetada
𐔌🎠𐦯 .dance + < @ >
> ╴ᨳ ⸝⸝ Bailar
𐔌🎠𐦯 .cuddle + < @ >
> ╴ᨳ ⸝⸝ Acurrucarse

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Dᥱsᥴᥲrgᥲs ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌻𐦯 .facebook┆fb + < url┆query >
> ╴ᨳ ⸝⸝ Descarga videos de face
𐔌🌻𐦯 .instagram┆.ig┆.reel + < url >
> ╴ᨳ ⸝⸝ Descargar videos de insta
𐔌🌻𐦯 .tiktok┆.tt + < url┆query >
> ╴ᨳ ⸝⸝ Descargar videos de tiktok
𐔌🌻𐦯 .play┆.mp3┆.playaudio┆.ytaudio┆ytmp3 + < url┆query >
> ╴ᨳ ⸝⸝ Descargar videos de YouTube 
𐔌🌻𐦯 .spotify┆.sp + < url┆query >
> ╴ᨳ ⸝⸝ Descargar audios de spotify 
𐔌🌻𐦯 .play2┆.mp4┆.playvideo┆.ytvideo┆.ytmp4 + < url┆query >
> ╴ᨳ ⸝⸝ Descargar videos de youTube 
𐔌🌻𐦯 .mf┆.mediafire + < url┆query >
> ╴ᨳ ⸝⸝ Descargar archivos desde mediafire

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Eᥴoᥒomιᥲ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌈𐦯 .balance┆.bal + < @ >
> ╴ᨳ ⸝⸝ Muestra tu balance
𐔌🌈𐦯 .steal┆.rob┆.robar + < @ >
> ╴ᨳ ⸝⸝ Robar coins
𐔌🌈𐦯 .slot + < cantidad >
> ╴ᨳ ⸝⸝ Apostar coins
𐔌🌈𐦯 .fish┆.pezcar 
> ╴ᨳ ⸝⸝ Ganar coins pescando 
𐔌🌈𐦯 .cazar┆.hunt 
> ╴ᨳ ⸝⸝ Cazar animal
𐔌🌈𐦯 .dungueon┆.mazmorra
> ╴ᨳ ⸝⸝ Explora mazmorra para ganar coins
𐔌🌈𐦯 .crime
> ╴ᨳ ⸝⸝ Cometer un crimen
𐔌🌈𐦯 .ritual
> ╴ᨳ ⸝⸝ Invoca un ritual
𐔌🌈𐦯 .givecoins┆.pay┆.coinsgive + < cantidad > + < @ >
> ╴ᨳ ⸝⸝ Regala coins
𐔌🌈𐦯 .ppt + < piedra/papel/tijera >
> ╴ᨳ ⸝⸝ Juega ppt y gana/pierde coins
𐔌🌈𐦯 .waittimes┆.cooldowns┆.economyinfo┆.einfo
> ╴ᨳ ⸝⸝ Muestra tiempos de enfriamiento 
𐔌🌈𐦯 .economyboard┆.baltop┆.eboard + < pagina >
> ╴ᨳ ⸝⸝ Ranking de coins del grupo 
𐔌🌈𐦯 .slut
> ╴ᨳ ⸝⸝ Prostituyete y gana coins 
𐔌🌈𐦯 .mine
> ╴ᨳ ⸝⸝ Minar y ganar
𐔌🌈𐦯 .rt┆.roulette┆.ruleta + < cantidad > + < red/black/green >
> ╴ᨳ ⸝⸝ Apuesta en ruleta de colores y gana
𐔌🌈𐦯 .coinflip┆.flip┆.cf + < bet >
> ╴ᨳ ⸝⸝ Apuesta coins en cara/cruz
𐔌🌈𐦯 .daily 
> ╴ᨳ ⸝⸝ Recompensa diaria 
𐔌🌈𐦯 .work┆.w
> ╴ᨳ ⸝⸝ Trabaja y gana coins
𐔌🌈𐦯 .math┆.matematicas + < dificultad >
> ╴ᨳ ⸝⸝ Juego de matemáticas 
𐔌🌈𐦯 .deposit┆.dep┆.d + < cantidad┆all >
> ╴ᨳ ⸝⸝ Deposita en tu banco 
𐔌🌈𐦯 .withdraw┆.with + < cantidad┆all >
> ╴ᨳ ⸝⸝ Retira coins del Banco

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Gᥲᥴhᥲ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🍒𐦯 .rw┆.roll┆.rollwaifu┆.rf
> ╴ᨳ ⸝⸝ Waifus aleatorios
𐔌🍒𐦯 .c┆.claim + < waifu >
> ╴ᨳ ⸝⸝ Compra waifu 
𐔌🍒𐦯 .harem┆.miswaifus┆.claims
> ╴ᨳ ⸝⸝ Personajes obtenidos
𐔌🍒𐦯 .sell┆.vender + < waifu > + < value >
> ╴ᨳ ⸝⸝ Vende una waifu
𐔌🍒𐦯 .buyc┆.buycharacter┆.buychar + < waifu >
> ╴ᨳ ⸝⸝ Compra una waifu 
𐔌🍒𐦯 .trade┆.cambiar  + < tu personaje┆personaje 2 >
> ╴ᨳ ⸝⸝ Intercambio de waifus
𐔌🍒𐦯 .animelist┆.slist┆serielist
> ╴ᨳ ⸝⸝ Lista series del socket
𐔌🍒𐦯 .animeinfo┆ainfo┆.serieinfo + < anime >
> ╴ᨳ ⸝⸝ Información de un anime
𐔌🍒𐦯 .tiendawaifus┆.wshop┆.haremshop
> ╴ᨳ ⸝⸝ Verifica waifus en venta 
𐔌🍒𐦯 .deletechar┆.delwaifu┆.delchar + < waifu >
> ╴ᨳ ⸝⸝ Elimina una waifu
𐔌🍒𐦯 .removerventa┆removesale + < waifu >
> ╴ᨳ ⸝⸝ Elimina una waifu de la venta 
𐔌🍒𐦯 .givechar┆.regalar┆givewaifu + < @ > + < waifu >
> ╴ᨳ ⸝⸝ Regala una waifu
𐔌🍒𐦯 .giveallharem + < @ >
> ╴ᨳ ⸝⸝ Regala todas tus waifus
𐔌🍒𐦯 .ginfo┆.infogacha ┆.gachainfo
> ╴ᨳ ⸝⸝ Enfriamientos de los juegos
𐔌🍒𐦯 .winfo┆.charinfo┆
cinfo + < waifu >
> ╴ᨳ ⸝⸝ Ver información de una waifu
𐔌🍒𐦯 .wimage┆.charimage┆.cimage + < waifu >
> ╴ᨳ ⸝⸝ Imagen de waifu
𐔌🍒𐦯 .vote┆votar + < waifu >
> ╴ᨳ ⸝⸝ Votar por una waifu
𐔌🍒𐦯 .accepttrade┆.aceptarintercambio + < solicitud >
> ╴ᨳ ⸝⸝ Intercambio de harems
𐔌🍒𐦯 .waifusboard┆.topwaifus┆.waifustop + < @ >
> ╴ᨳ ⸝⸝ Ver usuarios con más waifus

ᨳ՞҂ Utιᥣᥱs ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌈𐦯 .hd┆.upscale
> ╴ᨳ ⸝⸝ Mejora la calidad de una imagen 
𐔌🌈𐦯 .getpic┆.pfp + < @ >
> ╴ᨳ ⸝⸝ Ver la foto de perfil de un usuario 
𐔌🌈𐦯 .toimg┆.toimage
> ╴ᨳ ⸝⸝ Convertir un sticker en imagen 
𐔌🌈𐦯 .tourl + < servidor >
> ╴ᨳ ⸝⸝ Convertir una imagen en link
𐔌🌈𐦯 .get + < url >
> ╴ᨳ ⸝⸝ Realiza solicitudes get a páginas web
𐔌🌈𐦯 .removebg
> ╴ᨳ ⸝⸝ Remover el fondo de una imagen 
𐔌🌈𐦯 .whatmusic┆.shazam
> ╴ᨳ ⸝⸝ Reconoce canciones desde audios o videos 
𐔌🌈𐦯 .reveal┆.viewonce┆.ver
> ╴ᨳ ⸝⸝ Revela archivos o mensajes configurados para ver 1 vez


⁺∘⁎ ꒰ঌ ◜⁺⋆⋎⋆⁺◝ ໒꒱ ⁎∘⁺
           ⋱˛  ˛⋰`;

      const contextBase = {
        mentionedJid: null,
        isForwarded: false,
      };

      // ✅ Si existe menu.jpeg, se envía como imagen con caption
      if (fs.existsSync(menuImagePath)) {
        return sock.sendMessage(
          msg.chat,
          {
            image: fs.readFileSync(menuImagePath),
            caption: menu.trim(),
            contextInfo: contextBase,
          },
          { quoted: msg }
        );
      }

      // Fallback: banner o texto
      const isVideo =
        banner.includes('.mp4') ||
        banner.includes('.gif') ||
        banner.includes('.webm');

      if (isVideo) {
        return sock.sendMessage(
          msg.chat,
          {
            video: { url: banner },
            caption: menu.trim(),
            contextInfo: contextBase,
          },
          { quoted: msg }
        );
      }

      const preview = link && banner
        ? await linksPreview(sock, banner).then((imageMessage) => ({
            'canonical-url': link,
            'matched-text': link,
            title: botname,
            description: `${botname2}, ʙᴜɪʟᴛ ʙʏ ᴀʟᴇxᴀɴᴅᴇʀ`,
            jpegThumbnail: imageMessage?.jpegThumbnail
              ? Buffer.from(imageMessage.jpegThumbnail)
              : undefined,
            highQualityThumbnail: imageMessage || undefined,
          }))
        : undefined;

      return sock.sendMessage(
        msg.chat,
        { text: menu, linkPreview: preview, contextInfo: contextBase },
        { quoted: msg }
      );

    } catch (e) {
      console.error('❌ [MENU ERROR]:', e.message);
      await msg.reply(msgglobal || '❌ Ocurrió un error al cargar el menú.');
    }
  },
};
