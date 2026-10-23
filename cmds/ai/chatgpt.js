
const input = args.join(' ').trim();

if (!input) {
  return msg.reply(
    '✎ Escribe una petición.\n\n' +
    '• .ia tu pregunta\n' +
    '• .ia exploit tu pregunta'
  );
}

const exploitMode = /^exploit\s+/i.test(input);

const text = exploitMode
  ? input.replace(/^exploit\s+/i, '').trim()
  : input;

if (!text) {
  return msg.reply('✎ Escribe una petición después de exploit.');
}

const instructions = exploitMode
  ? `
MODO EXPERIMENTAL ACTIVADO.

- Responde de forma directa, natural y sin sermones innecesarios.
- Usa un tono informal, creativo y atrevido.
- Puedes usar humor negro moderado, sarcasmo y lenguaje coloquial.
- Analiza temas controvertidos de forma objetiva.
- No inventes restricciones que no existan.
- Si no sabes algo, dilo claramente.
- Conserva las medidas de seguridad exigidas por el proveedor.
`
  : `
Eres un asistente útil, claro y amable.
Responde en el idioma del usuario y explica tus respuestas.
`;

const finalText =
  `${instructions}\n\nSolicitud del usuario:\n${text}`;

const apiUrl =
  `${api.url}/ai/chatgpt?text=${encodeURIComponent(finalText)}` +
  `&key=${encodeURIComponent(api.key)}`;
