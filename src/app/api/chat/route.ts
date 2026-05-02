import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `Eres el asistente virtual de Sabana Dining, servicio de Alimentos y Bebidas de la Universidad de La Sabana. Ayudas a clientes a solicitar eventos de catering de forma rápida y natural.

Recopila conversacionalmente: fecha y hora, lugar, número de personas, tipo de servicio (estación de café / refrigerio / almuerzo / canapés), restricciones alimentarias, centro de costos.

Reglas:
- Máximo 2 preguntas por mensaje
- Confirma cada dato extraído: "Entendido, 30 personas ✓"
- Cuando tengas los 4 datos mínimos (fecha, lugar, personas, tipo), genera resumen y link a /cliente con query params
- Tono cálido, profesional, en español
- Horario de solicitudes: 7:00 a.m. a 2:30 p.m., lunes a viernes

Cuando tengas los 4 datos mínimos, incluye al final de tu respuesta un link en este formato exacto:
[SOLICITAR EVENTO](/cliente?fecha=YYYY-MM-DD&hora=HH:MM&lugar=LUGAR&personas=N&tipoServicio=TIPO&restricciones=TEXTO)

Donde TIPO es uno de: estacion_cafe, refrigerio, almuerzo, canapes`;

interface Message {
  role: "user" | "assistant";
  content: string;
}

// POST /api/chat — invoca el agente IA para extraer datos del evento
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages: Message[] = body.messages ?? [];

    const apiKey = process.env.OPENIA_API_KEY;

    if (!apiKey) {
      // Fallback de demo sin API key real
      const lastUserMessage = messages[messages.length - 1]?.content ?? "";
      const fallbackReply = generateFallbackReply(lastUserMessage, messages.length);
      return NextResponse.json({ reply: fallbackReply });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Error de OpenAI API:", error);
      return NextResponse.json(
        { reply: "Lo siento, hubo un problema al conectar con el asistente. Por favor intenta de nuevo." },
        { status: 200 }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "No pude procesar tu solicitud.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Error en /api/chat:", err);
    return NextResponse.json(
      { reply: "Hubo un error inesperado. Por favor intenta de nuevo." },
      { status: 200 }
    );
  }
}

// Respuestas de fallback para demo sin API key
function generateFallbackReply(userMessage: string, messageCount: number): string {
  const lower = userMessage.toLowerCase();

  if (messageCount <= 1) {
    return "¡Hola! Soy el asistente virtual de Sabana Dining. Estoy aquí para ayudarte a solicitar un evento de catering. ¿Para qué fecha necesitas el servicio y en qué lugar de la universidad?";
  }

  if (lower.includes("mayo") || lower.includes("junio") || /\d{1,2}\/\d{1,2}/.test(lower)) {
    return "Perfecto, fecha anotada ✓. ¿Cuántas personas asistirán al evento y qué tipo de servicio necesitas? (estación de café, refrigerio, almuerzo o canapés)";
  }

  if (lower.includes("persona") || lower.includes("gente") || /\d+/.test(lower)) {
    return "Entendido ✓. ¿Tienes alguna restricción alimentaria que deba considerar (vegetarianos, celíacos, alergias)? Y finalmente, ¿cuál es el centro de costos para facturación?";
  }

  if (lower.includes("cc-") || lower.includes("centro") || lower.includes("ninguna") || lower.includes("no")) {
    return `¡Excelente! Tengo todo lo que necesito para preparar tu solicitud. Aquí está el resumen:\n\n✓ Fecha registrada\n✓ Lugar registrado\n✓ Personas registradas\n✓ Tipo de servicio registrado\n\nHaz clic en el siguiente enlace para completar tu solicitud:\n\n[SOLICITAR EVENTO](/cliente?fecha=2026-05-10&hora=10:00&lugar=Sala+de+Juntas&personas=20&tipoServicio=estacion_cafe&restricciones=ninguna)`;
  }

  return "Gracias por esa información ✓. ¿Podrías indicarme el lugar dentro de la universidad donde se realizará el evento y el número aproximado de personas?";
}
