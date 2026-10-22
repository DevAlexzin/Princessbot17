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

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Grᥙρo ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🍯𐦯 .bot + < on┆off >
> ╴ᨳ ⸝⸝ Activa y desactiva el bot
𐔌🍯𐦯 .promote + < @ >
> ╴ᨳ ⸝⸝ Promueve a admi
𐔌🍯𐦯 .demote  + < @ >
> ╴ᨳ ⸝⸝ Degrada a un admi
𐔌🍯𐦯 .setprimary + < @ >
> ╴ᨳ ⸝⸝ Establece un bot como primario
𐔌🍯𐦯 .warn + < @ > + < razon >
> ╴ᨳ ⸝⸝ Añade una advertencia 
𐔌🍯𐦯 .mute + < @ >
> ╴ᨳ ⸝⸝ Silencia a un usuario 
𐔌🍯𐦯 .unmute + < @ >
> ╴ᨳ ⸝⸝ Saca el silencio del usuario 
𐔌🍯𐦯 .mutelist
> ╴ᨳ ⸝⸝ Lista de quienes están silenciados
𐔌🍯𐦯 .topcount┆.topmessages┆.topmensajes┆.topmsgcount
> ╴ᨳ ⸝⸝ Top de más mensajes
𐔌🍯𐦯 .setwelcome
> ╴ᨳ ⸝⸝ Configura una bienvenida
𐔌🍯𐦯 .setbye
> ╴ᨳ ⸝⸝ Configura una despedida 
𐔌🍯𐦯 .gstatus
> ╴ᨳ ⸝⸝ Sube un estado en el grupo
𐔌🍯𐦯 .warns + < @ >
> ╴ᨳ ⸝⸝ Todas las advertencias del usuario 
𐔌🍯𐦯 .delwarn + < @ > + < numero┆all >
> ╴ᨳ ⸝⸝ Elimina una advertencia 
𐔌🍯𐦯 .setwarnlimit + < numero >
> ╴ᨳ ⸝⸝ Establece maximo de advertencias
𐔌🍯𐦯 .clear + < delete┆views >
> ╴ᨳ ⸝⸝ Elimina usuarios inactivos (30 días)┆consulta actividad 
𐔌🍯𐦯 .setgpbanner
> ╴ᨳ ⸝⸝ Cambia la imagen del grupo 
𐔌🍯𐦯 .setgpname + < text >
> ╴ᨳ ⸝⸝ Cambia el nombre del grupo
𐔌🍯𐦯 .setgpdesc + < text >
> ╴ᨳ ⸝⸝ Cambia la descripción del grupo
𐔌🍯𐦯 .closet┆.open + < tiempo >
> ╴ᨳ ⸝⸝ Permite cerrar┆abrir el grupo (inmediato┆programado)
𐔌🍯𐦯 .welcome┆.bienvenidas + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva las bienvenidas
𐔌🍯𐦯 .antistatus┆.antiestados + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva los estados 
𐔌🍯𐦯 .alerts┆.alertas + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva las alertas 
𐔌🍯𐦯 .gacha + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva menu gacha
𐔌🍯𐦯 .rpg + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva menu rpg
𐔌🍯𐦯 .economy┆economía + < on┆off > 
> ╴ᨳ ⸝⸝ Activa┆desactiva menu economía 
𐔌🍯𐦯 .adminonly┆.onlyadmin + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva modo admin
𐔌🍯𐦯 .antilinks┆.antilink┆.antienlaces + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva antilinks
𐔌🍯𐦯 .goodbye┆.despedidas┆.bye + < on┆off >
> ╴ᨳ ⸝⸝ Activa┆desactiva despedidas
𐔌🍯𐦯 .groupinfo┆.gp
> ╴ᨳ ⸝⸝ Información del grupo
𐔌🍯𐦯 .tag┆.hidetag + < text >
> ╴ᨳ ⸝⸝ Menciona todos los usuarios del grupo
𐔌🍯𐦯 .kick + < @ >
> ╴ᨳ ⸝⸝ Expulsa un usuario

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Iᥲ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🎠𐦯 .ia┆.chatgpt + < query >
> ╴ᨳ ⸝⸝ Realiza una petición a chatgpt
𐔌🎠𐦯 .nano┆.nanobanana + < prompt >
> ╴ᨳ ⸝⸝ Genera una imagen con nano (Usando un prompt)

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Iᥒfo ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌻𐦯 .allmenu┆.menu┆.help + < category >
> ╴ᨳ ⸝⸝ Lista de comandos 
𐔌🌻𐦯 .infobot┆.infosocket┆.info
> ╴ᨳ ⸝⸝ Información del socket
𐔌🌻𐦯 .ping┆.p
> ╴ᨳ ⸝⸝ Velocidad del bot
𐔌🌻𐦯 .report┆.reporte + < error >
> ╴ᨳ ⸝⸝ Mensaje de reporte al staff 
𐔌🌻𐦯 .status
> ╴ᨳ ⸝⸝ Estado del bot
𐔌🌻𐦯 .sug┆.suggest + < suggest >
> ╴ᨳ ⸝⸝ Mensaje de sugerencia al staff
𐔌🌻𐦯 .invitar┆.invite + < link >
> ╴ᨳ ⸝⸝ Sugerencia de grupo a los mods

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Nsfᥕ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌈𐦯 .xnxx + < query┆url >
> ╴ᨳ ⸝⸝ Busca y descarga videos desde xnxx
𐔌🌈𐦯 .xvideos + < query┆url >
> ╴ᨳ ⸝⸝ Busca y descarga videos desde xvideos
𐔌🌈𐦯 .danbooru┆dbooru + < nombre >
> ╴ᨳ ⸝⸝ Buscar imágenes en danbooru
𐔌🌈𐦯 .r34┆.r34vid┆.rule34┆.rule34vid┆.rule┆.rulevid + < nombre >
> ╴ᨳ ⸝⸝ Buscar imágenes o videos en Rule34
𐔌🌈𐦯 .gelbooru┆.gbooru + < nombre >
> ╴ᨳ ⸝⸝ Buscar imágenes en gelbooru
𐔌🌈𐦯 .fap┆.paja + < @ >
> ╴ᨳ ⸝⸝ Hacerse una paja
𐔌🌈𐦯 .anal + < @ >
> ╴ᨳ ⸝⸝ Hacer un anal
𐔌🌈𐦯 .grabboobs + < @ >
> ╴ᨳ ⸝⸝ Agarrar las tetas de un usuario
𐔌🌈𐦯 .footjob + < @ >
> ╴ᨳ ⸝⸝ Hacer una paja con los pies a un usuario
𐔌🌈𐦯 .grope + < @ >
> ╴ᨳ ⸝⸝ Manosear las nalgas de un usuario
𐔌🌈𐦯 .undress┆.encuerar + < @ >
> ╴ᨳ ⸝⸝ Encuerate o encuera a un usuario
𐔌🌈𐦯 .sixnine┆.69 + < @ >
> ╴ᨳ ⸝⸝ Hacer un 69 con un usuario
𐔌🌈𐦯 .lickpussy + < @ >
> ╴ᨳ ⸝⸝ Lamer un coño de un usuario
𐔌🌈𐦯 .spank┆.nalgada + < @ >
> ╴ᨳ ⸝⸝ Darle una nalgada a un usuario
𐔌🌈𐦯 .fuck┆.coger + < @ >
> ╴ᨳ ⸝⸝ Coger a un usuario
𐔌🌈𐦯 .suckboobs┆.chupartetas + < @ >
> ╴ᨳ ⸝⸝ Chupar las tetas de un usuario
𐔌🌈𐦯 .yuri┆.tijeras + < @ >
> ╴ᨳ ⸝⸝ Hacer tijeras con un usuario
𐔌🌈𐦯 .cummouth + < @ >
> ╴ᨳ ⸝⸝ Corrida en la boca de un usuario
𐔌🌈𐦯 .cumshot + < @ >
> ╴ᨳ ⸝⸝ Eyacular sobre un usuario
𐔌🌈𐦯 .lickdick┆.lamerpolla + < @ >
> ╴ᨳ ⸝⸝ Lamer la polla de un usuario
𐔌🌈𐦯 .lickass┆.lamercullo + < @ >
> ╴ᨳ ⸝⸝ Lamer el culo de un usuario
𐔌🌈𐦯 .handjob + < @ >
> ╴ᨳ ⸝⸝ Hacer una paja manual a un usuario
𐔌🌈𐦯 .blowjob┆.mamar┆.bj + < @ >
> ╴ᨳ ⸝⸝ Dar una mamada a un usuario
𐔌🌈𐦯 .boobjob┆.rusa + < @ >
> ╴ᨳ ⸝⸝ Hacer una rusa a un usuario
𐔌🌈𐦯 .cum┆.eyacular + < @ >
> ╴ᨳ ⸝⸝ Eyacular dentro de un usuario

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Pᥱrfιᥣ ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🍒𐦯 .level┆.levelup┆.lvl + < @ >
> ╴ᨳ ⸝⸝ Muestra información de tu nivel y progreso
𐔌🍒𐦯 .count┆.mensajes┆.message┆.msgcount + < @ >
> ╴ᨳ ⸝⸝ Ver tus contadores de mensajes
𐔌🍒𐦯 .marry + < @ >
> ╴ᨳ ⸝⸝ Envia una solicitud de matrimonio a un usuario
𐔌🍒𐦯 .divorce 
> ╴ᨳ ⸝⸝ Divorciate de tu pareja
𐔌🍒𐦯 .profile┆.perfil 
> ╴ᨳ ⸝⸝ Muestra tu perfil o la de un usuario
𐔌🍒𐦯 .setbirth + < dia/mes/año|mes/dia >
> ╴ᨳ ⸝⸝ Define una fecha de nacimiento a tu perfil
𐔌🍒𐦯 .setpasatiempo┆.sethobby 
> ╴ᨳ ⸝⸝ Establece o cambia tu pasatiempo en el perfil
𐔌🍒𐦯 .delbirth
> ╴ᨳ ⸝⸝ Elimina tu cumpleaños 
𐔌🍒𐦯 .delpasatiempo┆.removehobby
> ╴ᨳ ⸝⸝ Elimina tu pasatiempo 
𐔌🍒𐦯 .setdescription┆.setdesc + < text >
> ╴ᨳ ⸝⸝ Define una descripción a tu perfil 
𐔌🍒𐦯 .deldescription┆.deldesc
> ╴ᨳ ⸝⸝ Elimina tu descripción 
𐔌🍒𐦯 .setgenre + < hombre┆mujer>
> ╴ᨳ ⸝⸝ Define un género a tu perfil 
𐔌🍒𐦯 .delgenre
> ╴ᨳ ⸝⸝ Elimina tu genero

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Bᥙsᥴᥲdor ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🍯𐦯 .pinterest┆.pin + < query >
> ╴ᨳ ⸝⸝ Busca imágenes en pinterest 
𐔌🍯𐦯 .imdb + < query >
> ╴ᨳ ⸝⸝ Busca info de películas y series en imdb
𐔌🍯𐦯 .applemusicsearch┆.ams + < query >
> ╴ᨳ ⸝⸝ Busca información en apple music
𐔌🍯𐦯 .imagen┆.img + < query >
> ╴ᨳ ⸝⸝ Busca imágenes en google 
𐔌🍯𐦯 .wikipedia┆.wiki + < query >
> ╴ᨳ ⸝⸝ Busca información en wikipedia 
𐔌🍯𐦯 .aptoide┆.apk┆.apkdl + < query >
> ╴ᨳ ⸝⸝ Descarga aplicaciones de aptoide
𐔌🍯𐦯 .ytsearch┆.search + < query >
> ╴ᨳ ⸝⸝ Busca videos de youtube 
𐔌🍯𐦯 .ttsearch┆.tiktoksearch┆.tts + < query >
> ╴ᨳ ⸝⸝ Busca videos de tiktok 

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Soᥴkᥱt ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🎠𐦯 .bots┆.sockets
> ╴ᨳ ⸝⸝ Número de socket conectados
𐔌🎠𐦯 .code┆.qr
> ╴ᨳ ⸝⸝ Vincular un socket a tu número 
𐔌🎠𐦯 .self + < on┆off >
> ╴ᨳ ⸝⸝ Haz privado┆público tu socket
𐔌🎠𐦯 .setbanner┆.setmenubanner
> ╴ᨳ ⸝⸝ Cambia el banner del menu
𐔌🎠𐦯 .join┆.unir + < enlace >
> ╴ᨳ ⸝⸝ Une el bot a un grupo
𐔌🎠𐦯 .setbotname┆.setname + < corto┆largo >
> ╴ᨳ ⸝⸝ Cambia el nombre del grupo 
𐔌🎠𐦯 .setbotowner + < nombre┆numero >
> ╴ᨳ ⸝⸝ Cambiar el dueño del bot
𐔌🎠𐦯 .setcurrency + < value >
> ╴ᨳ ⸝⸝ Cambia la moneda del bot
𐔌🎠𐦯 .setbotprefix + < value >
> ╴ᨳ ⸝⸝ Cambiar el prefijo del bot
𐔌🎠𐦯 .setbotlink┆.setlink + < value >
> ╴ᨳ ⸝⸝ Cambiar el enlace del bot 
𐔌🎠𐦯 .logout
> ╴ᨳ ⸝⸝ Elimina la sesión del bot 
𐔌🎠𐦯 .reload
> ╴ᨳ ⸝⸝ Recarga la sesión del bot 
𐔌🎠𐦯 .setusername + < value >
> ╴ᨳ ⸝⸝ Cambiar el nombre usuario
𐔌🎠𐦯 .setstatus + < value >
> ╴ᨳ ⸝⸝ Actualiza el estado del bot
𐔌🎠𐦯 .setpfp┆.setimage 
> ╴ᨳ ⸝⸝ Cambiar la imagen de perfil 
𐔌🎠𐦯 .leave
> ╴ᨳ ⸝⸝ El bot abandona el grupo actual

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

ᨳ՞҂ Stιᥴkᥱrs ֊՞
ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ ╴╴╴╴ꕤ

𐔌🌻𐦯 .setmeta┆.setstickermeta + < packname┆author >
> ╴ᨳ ⸝⸝ Define metadatos para stickers
𐔌🌻𐦯 .setstickerspackname┆.setpackname┆.packname + < pack┆nuevoname >
> ╴ᨳ ⸝⸝ Renombra uno de tus paquetes de stickers
𐔌🌻𐦯 .sticker┆.s + < pack > + < autor >
> ╴ᨳ ⸝⸝ Convierte imágenes┆videos en stickers 
𐔌🌻𐦯 .stickerpack┆.spack + < query >
> ╴ᨳ ⸝⸝ Busca y descarga paquetes de stickers 
𐔌🌻𐦯 .packdesc┆.setpackdesc┆.setstickerpackdesc + < paquete > + < descripción >
> ╴ᨳ ⸝⸝ Cambiar la descripción de un paquete de stickers 
𐔌🌻𐦯 .packprivate┆.setpackpriv┆.setpackprivate + < paquete >
> ╴ᨳ ⸝⸝ Establecer un paquete de stickers como privado 
𐔌🌻𐦯 .packpublic┆.setpackpub┆.setpackpublic + < paquete >
> ╴ᨳ ⸝⸝ Establece un paquete de stickers como privado 
𐔌🌻𐦯 .packlist┆.stickerpacks
Lista de tus paquetes 
𐔌🌻𐦯 .newpack┆newstickerpack + < paquete >
> ╴ᨳ ⸝⸝ Crea un nuevo paquete de stickers 
𐔌🌻𐦯 .getpack┆.pack┆.stickerpack + < paquete >
> ╴ᨳ ⸝⸝ Obtener un paquete de stickers 
𐔌🌻𐦯 .stickerdel┆.delsticker
> ╴ᨳ ⸝⸝ Eliminar sticker de un paquete
𐔌🌻𐦯 .delpack + < paquete >
> ╴ᨳ ⸝⸝ Eliminar un paquete de stickers 
𐔌🌻𐦯 .delmeta┆.delstickermeta
> ╴ᨳ ⸝⸝ Eliminar los metadatos de tus stickers 
𐔌🌻𐦯 .addsticker┆.stickeradd
> ╴ᨳ ⸝⸝ Agregar un sticker a un paquete 

             ु   ᨳ𐔌՞֊ ˕ ֊՞𐦯ᜊ  ु  

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
