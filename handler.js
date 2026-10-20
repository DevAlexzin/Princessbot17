import db from "#db"
import ws from 'ws';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import gradient from 'gradient-string';
import { getCachedMeta, setCachedMeta } from '#serialize';

export default async (sock, msg) => {

  if (msg.fromMe && !msg.key.participant && msg.isBot) return;  
  const sender = msg.sender;
  let body = msg.body || '';

  const from = msg.key.remoteJid
  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net' || sock.user.lid

  const chatData = await db.getChat(msg.chat)
  const settings = await db.getSettings(botJid)  

  // ============================================================
  // ✅ CANCELAR RULETA
  // ============================================================
  if (msg.text && msg.text.toLowerCase().trim() === 'cancelar') {
    const estado = global.ruletasActivas?.[msg.chat];
    
    if (estado && !estado.cancelado) {
      estado.cancelado = true;
      
      await sock.sendMessage(msg.chat, {
        text: `⏹️ *Ruleta cancelada*

> ✅ *${estado.usuarioTag}* se salvó de ser eliminado.

> 📊 *Uso:* No se contó en el límite diario.`
      }, { quoted: msg });
      
      delete global.ruletasActivas[msg.chat];
      return;
    }
  }
  // ============================================================
  // FIN CANCELAR RULETA
  // ============================================================

  // ============================================================
  // 🤖 MANEJADOR DE IA (Princess Bot)
  // ============================================================
  if (msg.isGroup && msg.mentionedJid?.includes(botJid)) {
    try {
      let textoPregunta = (msg.text || msg.body || '').replace(/@\d{8,15}/g, '').trim();

      if (textoPregunta) {
        console.log(`🤖 [IA] Pregunta: ${textoPregunta}`);

        // Obtenemos el prompt base y la memoria del chat
        const promptGuardado = settings.iaPrompt || '';
        const memoriaChat = chatData.iaMemoria || [];
        const contextoMemoria = memoriaChat.length > 0 ? `Recuerda esta información previa: ${memoriaChat.join(' | ')}` : '';

        // ✅ Capturamos las menciones del mensaje del usuario (para cuando pide etiquetar)
        const mencionesUsuario = msg.mentionedJid?.filter(jid => jid !== botJid) || [];
        const textoMenciones = mencionesUsuario.length > 0 
          ? `El usuario mencionó a estos números: ${mencionesUsuario.map(j => j.split('@')[0]).join(', ')}` 
          : 'El usuario no mencionó a nadie más.';

        // ✅ PERSONALIDAD Y HERRAMIENTAS CORREGIDAS
        const instruccionesSistema = `Tu nombre es Princess Bot.
Fuiste creada para Rocio (ella es la dueña del bot), pero ESTÁS HABLANDO CON: @${sender.split('@')[0]}. No llames "Rocio" al usuario a menos que te lo pida.
Tu creador está oculto por privacidad.
Actúa como una persona real, amigable y servicial.
${promptGuardado}
${contextoMemoria}
${textoMenciones}

INSTRUCCIONES ESTRICTAS:
1. Si te piden GUARDAR algo, responde EXACTAMENTE con: [GUARDAR: el texto a guardar]
2. Si te piden RECORDAR o ENVIAR un mensaje guardado, NO uses [ENVIAR], simplemente escribe el mensaje que guardaste en el chat normal.
3. Si te piden ETIQUETAR a las personas que mencionaron, responde EXACTAMENTE con: [MENCIONAR: @numero1,@numero2,@numero3,@numero4 | mensaje que acompaña]
4. Si te piden ENVIAR UN PRIVADO a alguien específico, usa: [ENVIAR: numero | mensaje]
5. Si solo te hablan normal, responde normal.`;

        const consultaFinal = `Instrucciones: ${instruccionesSistema}. Usuario dice: ${textoPregunta}`;
        const urlAPI = `https://api.delirius.online/ia/chatgpt?q=${encodeURIComponent(consultaFinal)}`;

        console.log(`🌐 [IA] Consultando API...`);
        
        const res = await fetch(urlAPI, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });

        const textoRespuesta = await res.text();

        if (textoRespuesta.startsWith('<!DOCTYPE') || textoRespuesta.startsWith('<html')) {
          console.log('⚠️ [IA] La API devolvió HTML (Caída)');
          return msg.reply('❌ La IA no está disponible. La API está caída.');
        }

        let json;
        try {
          json = JSON.parse(textoRespuesta);
        } catch (e) {
          console.error('⚠️ [IA] Error parseando JSON:', textoRespuesta.slice(0, 200));
          return msg.reply('❌ La IA devolvió una respuesta inválida.');
        }

        const respuestaIA = json.result || json.response || json.answer || json.data || json.message;

        if (!respuestaIA) {
          console.log('⚠️ [IA] Respuesta vacía de la API:', JSON.stringify(json).slice(0, 200));
          return msg.reply('❌ La IA no devolvió una respuesta válida.');
        }

        console.log(`🧠 [IA] Respuesta cruda: ${respuestaIA}`);

        // ✅ DETECTAMOS SI QUIERE GUARDAR
        const matchGuardar = respuestaIA.match(/\[GUARDAR:\s*(.+?)\]/s);
        if (matchGuardar) {
          const textoAGuardar = matchGuardar[1].trim();
          let memoria = chatData.iaMemoria || [];
          memoria.push(textoAGuardar);
          await db.updateChat(msg.chat, 'iaMemoria', memoria);
          await msg.reply(`🧠 *Princess Bot ha guardado:* "${textoAGuardar}"`);
          console.log('✅ [IA] Memoria guardada correctamente.');
          return;
        }

        // ✅ DETECTAMOS SI QUIERE ENVIAR PRIVADO
        const matchEnviar = respuestaIA.match(/\[ENVIAR:\s*(.+?)\s*\|\s*(.+?)\]/s);
        if (matchEnviar) {
          const numeroDestino = matchEnviar[1].replace(/\D/g, '');
          const mensajeAEnviar = matchEnviar[2].trim();
          
          try {
            await sock.sendMessage(numeroDestino + '@s.whatsapp.net', { text: mensajeAEnviar });
            await msg.reply(`✅ Mensaje privado enviado a ${numeroDestino}.`);
            console.log('✅ [IA] Mensaje privado enviado correctamente.');
          } catch (err) {
            await msg.reply(`❌ No pude enviar el mensaje a ${numeroDestino}.`);
            console.log('❌ [IA] Error al enviar privado:', err.message);
          }
          return;
        }

        // ✅ DETECTAMOS SI QUIERE MENCIONAR EN EL GRUPO (Soporta múltiples menciones)
        const matchMencionar = respuestaIA.match(/\[MENCIONAR:\s*(.+?)\s*\|\s*(.+?)\]/s);
        if (matchMencionar) {
          const numerosTexto = matchMencionar[1];
          const mensajeMencion = matchMencionar[2].trim();
          
          // Separamos los números por coma (ej: @549111, @549222)
          const numerosArray = numerosTexto.split(',')
            .map(num => num.replace(/\D/g, ''))
            .filter(num => num.length > 0);

          if (numerosArray.length > 0) {
            const mentionsFinal = numerosArray.map(num => num + '@s.whatsapp.net');
            await sock.sendMessage(msg.chat, { 
              text: mensajeMencion, 
              mentions: mentionsFinal 
            }, { quoted: msg });
            console.log('✅ [IA] Menciones enviadas correctamente.');
          } else {
            // Si falló la extracción, enviamos texto normal
            await sock.sendMessage(msg.chat, { text: respuestaIA }, { quoted: msg });
          }
          return;
        }

        // Si no usó herramientas, responde normal (Aquí cae si decide "recordar" un mensaje)
        await sock.sendMessage(msg.chat, { text: `${respuestaIA}` }, { quoted: msg });
        console.log('✅ [IA] Respuesta normal enviada correctamente.');
      }
    } catch (e) {
      console.error("❌ [IA ERROR CRÍTICO]:", e.message);
      await msg.reply('❌ Ocurrió un error al conectar con la IA.');
    }
    return; // Detenemos el procesamiento
  }
  // ============================================================
  // FIN MANEJADOR DE IA
  // ============================================================

  // ============================================================
  // MANEJADOR DE BOTONES DE GANADORES
  // ============================================================
  if (msg.message?.buttonsResponseMessage) {
    const buttonId = msg.message.buttonsResponseMessage.selectedButtonId;
    const buttonText = msg.message.buttonsResponseMessage.selectedDisplayText;
    const chatId = msg.key.remoteJid;

    if (buttonId && buttonId.startsWith('ganadores_')) {
      const dia = buttonId.replace('ganadores_', '');
      const emojiDia = {
        lunes: '🍯',
        martes: '🍒',
        miercoles: '🪩',
        jueves: '👯‍♀️',
        viernes: '🏹',
        sabado: '🌈',
        extras: '✨'
      };

      const nombreDia = {
        lunes: 'Lunes',
        martes: 'Martes',
        miercoles: 'Miércoles',
        jueves: 'Jueves',
        viernes: 'Viernes',
        sabado: 'Sábado',
        extras: 'Extras'
      };

      // Recuperamos los datos temporales guardados por el comando
      const temporal = global.ganadoresTemporal?.[chatId];

      if (!temporal) {
        await sock.sendMessage(chatId, {
          text: '❌ No se encontraron datos para anotar. Vuelve a usar el comando `.ganadores` con los datos.'
        }, { quoted: msg });
        return;
      }

      // Verificamos que no hayan pasado más de 5 minutos
      const tiempoTranscurrido = Date.now() - temporal.timestamp;
      if (tiempoTranscurrido > 5 * 60 * 1000) {
        delete global.ganadoresTemporal[chatId];
        await sock.sendMessage(chatId, {
          text: '⏳ Los datos han expirado. Vuelve a usar el comando `.ganadores` con los datos.'
        }, { quoted: msg });
        return;
      }

      // Guardamos en la base de datos
      const ahora = new Date();
      const año = ahora.getFullYear();
      const inicioAño = new Date(año, 0, 1);
      const diasTranscurridos = Math.floor((ahora - inicioAño) / 86400000);
      const semana = Math.ceil((diasTranscurridos + inicioAño.getDay() + 1) / 7);

      const chatDataGanadores = await db.getChat(chatId);
      const dbKey = `ganadores_semana_${año}_${semana}`;
      let ganadores = chatDataGanadores[dbKey] || {
        lunes: [], martes: [], miercoles: [], jueves: [], viernes: [], sabado: [], extras: []
      };

      // ✅ VALIDACIÓN EXTRA: Verificar cuántas veces ha ganado esta semana
      let vecesGanadas = 0;
      for (const key of ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'extras']) {
        const items = ganadores[key] || [];
        vecesGanadas += items.filter(item => item.numero === temporal.numero).length;
      }

      if (vecesGanadas >= 2) {
        delete global.ganadoresTemporal[chatId];
        await sock.sendMessage(chatId, {
          text: `⚠️ *Este número ya ganó 2 veces esta semana.*\n\n> 📱 Número: ${temporal.numero}\n> 👤 Nombre: ${temporal.nombre}\n\n*No puede ganar más de 2 veces por semana.*`
        }, { quoted: msg });
        return;
      }

      // Agregamos al día correspondiente
      ganadores[dia].push({
        numero: temporal.numero,
        premio: temporal.premio,
        nombre: temporal.nombre,
        fecha: ahora.toISOString()
      });

      await db.updateChat(chatId, dbKey, ganadores);

      // Limpiamos los datos temporales
      delete global.ganadoresTemporal[chatId];

      // Confirmamos el registro
      await sock.sendMessage(chatId, {
        text: `✅ *Ganador anotado correctamente*

> 📱 Número: ${temporal.numero}
> 🎁 Premio: ${temporal.premio}
> 👤 Nombre: ${temporal.nombre}
> 📅 Día: ${emojiDia[dia]} ${nombreDia[dia]}
> 📊 Veces ganadas esta semana: ${vecesGanadas + 1}/2`
      }, { quoted: msg });
      
      return; // Detenemos el procesamiento
    }
  }
  // ============================================================
  // FIN MANEJADOR DE BOTONES
  // ============================================================

  const isOwner = global.owner.map(num => num + '@s.whatsapp.net').includes(sender);
  const isROwner = [botJid, ...(settings.owner ? [settings.owner] : []), ...global.owner.map(num => num + '@s.whatsapp.net')].includes(sender);

  let groupMetadata = null;
  let groupName = '';
  if (msg.isGroup) {
    groupMetadata = getCachedMeta(msg.chat);
    if (!groupMetadata) {
      groupMetadata = await sock.groupMetadata(msg.chat).catch(() => null);
      if (groupMetadata) setCachedMeta(msg.chat, groupMetadata);
    }
    groupName = groupMetadata?.subject || '';
  }
  const participants = groupMetadata?.participants || [];
  const adminSet = new Set(participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').flatMap(p => [p.id?.split('@')[0], p.lid?.split('@')[0], p.phoneNumber?.split('@')[0]].filter(Boolean)));
  const senderBase = sender.split('@')[0];
  const botBase = botJid.split('@')[0];
  const isBotAdmins = msg.isGroup ? adminSet.has(botBase) : false;
  const isAdmins = msg.isGroup ? adminSet.has(senderBase) : false;

  Promise.allSettled((global.cmdsExecute ?? []).filter(p => p.type === 'all').map(p => p.fn({ msg, sock, groupMetadata, participants, isAdmins, isBotAdmins, isOwner, __dirname: p.dirname }).catch(e => console.error(chalk.gray(`[ ✿ ] Error all-plugin ${p.key}: ${e.message}`)))));

  const tf = await db.getChatUser(msg.chat, msg.sender)
  const to = new Date().toLocaleDateString('es-CO', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-') 

  if (!tf) {
    await db.updateChatUser(msg.chat, msg.sender, { stats: { [to]: { msgs: 0, cmds: 0 } } });
  } else {
    if (!tf.stats) tf.stats = {}
    if (!tf.stats[to]) tf.stats[to] = { msgs: 0, cmds: 0 }
    tf.stats[to].msgs++
    await db.updateChatUser(msg.chat, msg.sender, 'stats', tf.stats)
  }

  const rawBotname = settings.namebot2 || 'Stellar';
  const tipo = settings.type || 'Sub';
  const cleanBotname = rawBotname.replace(/[^a-zA-Z0-9\s]/g, '');
  const namebot = cleanBotname || 'Stellar';
  const shortForms = [namebot.charAt(0), namebot.split(" ")[0], tipo.split(" ")[0], namebot.split(" ")[0].slice(0, 2), namebot.split(" ")[0].slice(0, 3)];
  const prefixes = shortForms.map(name => `${name}`);
  prefixes.unshift(namebot);
  let prefix;
  if (Array.isArray(settings.prefijo) || typeof settings.prefijo === 'string') {
    const prefixArray = Array.isArray(settings.prefijo) ? settings.prefijo : [settings.prefijo];
    prefix = new RegExp('^(' + prefixes.join('|') + ')?(' + prefixArray.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'i');
  } else if (settings.prefijo === 1) {
    prefix = new RegExp('^', 'i');
  } else {
    prefix = new RegExp('^(' + prefixes.join('|') + ')?', 'i');
  }
  const strRegex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
  let customCmd = null;
  let pluginPrefix = prefix;
  for (const [cmdName, data] of global.comandos) {
    if (!data.customPrefix) continue;
    const cp = data.customPrefix;
    const ms = cp instanceof RegExp ? [[cp.exec(msg.text), cp]] : Array.isArray(cp) ? cp.map(p => { let r = p instanceof RegExp ? p : new RegExp(strRegex(p)); return [r.exec(msg.text), r]; }) : typeof cp === 'string' ? [[new RegExp(strRegex(cp)).exec(msg.text), new RegExp(strRegex(cp))]] : [[null, null]];
    if (ms.find(p => p[0])) { customCmd = cmdName; pluginPrefix = cp; break; }
  }
  let matchs = pluginPrefix instanceof RegExp ? [[pluginPrefix.exec(msg.text), pluginPrefix]] : Array.isArray(pluginPrefix) ? pluginPrefix.map(p => {
    let regex = p instanceof RegExp ? p : new RegExp(strRegex(p));
    return [regex.exec(msg.text), regex];
  }) : typeof pluginPrefix === 'string' ? [[new RegExp(strRegex(pluginPrefix)).exec(msg.text), new RegExp(strRegex(pluginPrefix))]] : [[null, null]];
  let match = matchs.find(p => p[0]) || null;

  for (const p of (global.cmdsExecute ?? [])) {
    if (p.type !== 'before') continue;
    try {
      if (await p.fn({ msg, sock, match, groupMetadata, participants, isAdmins, isBotAdmins, isOwner, __dirname: p.dirname })) continue;
    } catch (e) {
      console.error(chalk.gray(`[ ✿ ] Error before-plugin ${p.key}: ${e.message}`));
    }
  }

  if (!match) return;
  let usedPrefix = (match[0] || [])[0] || '';
  let args = msg.text.slice(usedPrefix.length).trim().split(" ");
  let command = customCmd ?? (args.shift() || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let text = args.join(' ');
  if (!command) return;

  const pushname = msg.pushName || 'Sin nombre'

  const consolePrimary = chatData.primaryBot;

  if (msg.message || !consolePrimary || consolePrimary === botJid) {
    console.log(`
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄
❚ ▸ ${chalk.cyan('𝐁𝐎𝐓 ❱❱')} ${chalk.bgMagenta(chalk.white.italic(sock.user.name))}
❚ ▸ ${chalk.cyan('𝐇𝐎𝐑𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.black.bgWhite(moment().format('DD/MM/YY HH:mm:ss'))}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.green('𝐔𝐒𝐔𝐀𝐑𝐈𝐎 ❱❱')} ${chalk.white(pushname)} / ${chalk.bgMagentaBright.bold(msg.isGroup ? 'Grupo' : 'Chat Private')}
❚ ▸ ${chalk.green('𝐂𝐎𝐌𝐀𝐍𝐃𝐎 ❱❱')} ${chalk.magentaBright(command ? command : 'No Command')}
❚ ${chalk.magentaBright('°o.OO.o°°o.OO.o°°o.OO.o°')}
❚ ▸ ${chalk.redBright('𝐓𝐈𝐏𝐎 ❱❱')} ${chalk.greenBright.bold('[Bot Log]')}
𝄢 · • —– ٠ ✤ ٠ —– • · · • —– ٠ ✤ ٠ —– • ·✧༄`.trim())
  }

  const hasPrefix = (settings.prefijo === 1 || settings.prefijo === true) ? true : (Array.isArray(settings.prefijo) ? settings.prefijo : typeof settings.prefijo === 'string' ? [settings.prefijo] : []).some(p => msg.text?.startsWith(p));
  const botprimaryId = chatData?.primaryBot;
  if (botprimaryId && botprimaryId !== botJid) {
    if (hasPrefix) {
      const groupJids = participants.map(p => p.id);
      const sessionDirs = ['./Sessions/Subs']
      function getAllSessionBots() {
        const bots = [];
        for (const dir of sessionDirs) {
          try {
            for (const sub of fs.readdirSync(path.resolve(dir))) {
              if (fs.existsSync(path.resolve(dir, sub, 'creds.json')))
                bots.push(sub + '@s.whatsapp.net');
            }
          } catch {}
        }
        try {
          if (fs.existsSync(path.resolve('./Sessions/Owner/creds.json'))) {
            const ownerId = global.sock?.user?.id?.split(':')[0] + '@s.whatsapp.net';
            if (ownerId) bots.push(ownerId);
          }
        } catch {}
        return bots;
      }
      const sessionBots = getAllSessionBots();
      const primaryInGroup = groupJids.includes(botprimaryId);
      const isPrimarySelf = botprimaryId === botJid;
      const primaryInSessions = sessionBots.includes(botprimaryId);
      if (!primaryInSessions || !primaryInGroup) return;
      if ((primaryInSessions && primaryInGroup) || isPrimarySelf) return;
    }
  }

  const isVotOwn = [
    sock.user.id.split(':')[0] + '@s.whatsapp.net',
    ...global.owner.map(num => num + '@s.whatsapp.net')
  ].includes(sender)

  if (settings.self) {
    const owner = settings.owner
    if (
      sender !== owner &&
      !isVotOwn &&
      !global.mods.map(num => num + '@s.whatsapp.net').includes(sender)
    ) return
  }

  if (msg.chat && !msg.chat.endsWith('g.us')) {
    const allowedInPrivateForUsers = ['report', 'reporte', 'sug', 'suggest', 'invite', 'invitar', 'setusername', 'setpfp', 'setimage', 'setstatus', 'reload', 'setname', 'setbotname', 'setmenubanner', 'setbanner', 'setbotcurrency', 'code', 'qr', 'setbotowner', 'setlink', 'setbotlink', 'setbotprefix']
    const owners = settings.owner
    if (
      sender !== owners &&
      !global.owner.map(num => num + '@s.whatsapp.net').includes(sender) &&
      !allowedInPrivateForUsers.includes(command)
    ) return
  }

  if (chatData?.bannedGrupo && !['#bot on', '/bot on', '.bot on', '!bot on', '-bot on', '+bot on', 'bot on'].includes(body.toLowerCase()) &&
      !global.owner.map(num => num + '@s.whatsapp.net').includes(msg.sender)) return

  if (chatData.adminonly && !isAdmins) return

  if ((msg.id.startsWith("3EB0") || (msg.id.startsWith("BAE5") && msg.id.length === 16) || (msg.id.startsWith("B24E") && msg.id.length === 20))) return

  const user = await db.getChatUser(msg.chat, msg.sender)

  const today = new Date().toLocaleDateString('es-CO', { 
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).split('/').reverse().join('-') 

  if (!user) {
    await db.updateChatUser(msg.chat, msg.sender, { stats: { [today]: { msgs: 0, cmds: 0 } } });
  } else {
    if (!user.stats) user.stats = {}
    if (!user.stats[today]) user.stats[today] = { msgs: 0, cmds: 0 }
  }

  const cmdData = global.comandos.get(command);

  if (!cmdData || user.muted === 1 || user.muted === true) {
    if (settings.prefijo === 1 || settings.prefijo === true || user.muted === 1 || user.muted === true) return
    await sock.readMessages([msg.key])
    return msg.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
  }

  const comando = msg.text.slice(usedPrefix.length)

  if (cmdData.isOwner && !global.owner.map(num => num + '@s.whatsapp.net').includes(sender)) {
    return msg.reply(`ꕤ El comando *${command}* no existe.\n✎ Usa *${usedPrefix}help* para ver la lista de comandos disponibles.`)
  }

  if (cmdData.isAdmin && !isAdmins) return sock.reply(msg.chat, mess.admin, msg)
  if (cmdData.botAdmin && !isBotAdmins) return sock.reply(msg.chat, mess.botAdmin, msg)

  try {
    await sock.readMessages([msg.key])
    const user2 = await db.getUser(msg.sender)

    if (!user2) {
      await db.updateUser(msg.sender, { usedcommands: 1, exp: Math.floor(Math.random() * 100), name: msg.pushName })
    } else {
      user2.usedcommands = (user2.usedcommands || 0) + 1
      user2.exp = (user2.exp || 0) + Math.floor(Math.random() * 100)
      user2.name = msg.pushName
      await db.updateUser(msg.sender, 'exp', user2.exp)
      await db.updateUser(msg.sender, 'name', user2.name)
      await db.updateUser(msg.sender, 'usedcommands', user2.usedcommands)
    }

    settings.commandsejecut = (settings.commandsejecut || 0) + 1
    await db.updateSettings(botJid, 'commandsejecut', settings.commandsejecut)

    const userStats = await db.getChatUser(msg.chat, msg.sender)
    if (userStats && userStats.stats && userStats.stats[today]) {
      userStats.stats[today].cmds++
      await db.updateChatUser(msg.chat, msg.sender, 'stats', userStats.stats)
    }

    await cmdData.run({ msg, sock, args, command, usedPrefix, text, groupMetadata, participants, isAdmins, isBotAdmins, isOwner, __dirname: global.plugins[cmdData.pluginKey]?.dirname });
  } catch (error) {
    console.log(error)
    return msg.reply(`${error}`)
  }

};
