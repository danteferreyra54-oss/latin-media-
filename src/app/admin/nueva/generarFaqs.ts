"use server";

import { Anthropic } from "@anthropic-ai/sdk";

interface Faq {
  pregunta: string;
  respuesta: string;
}

export async function generarFaqs(titulo: string, bajada: string, cuerpo: string): Promise<Faq[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }

  const client = new Anthropic();

  const prompt = `Eres un editor de noticias. Tu tarea es generar 3-4 preguntas frecuentes (FAQ) basadas en una nota de prensa.

NOTA:
Título: ${titulo}
Copete: ${bajada}
Cuerpo: ${cuerpo}

Genera preguntas que:
- Sean claras y directas
- Aborden los puntos principales de la nota
- Tengan respuestas que se encuentren en la nota
- Sean útiles para lectores que quieren entender rápido el tema

Devuelve SOLO un JSON array con este formato (sin explicaciones previas):
[
  { "pregunta": "¿Pregunta clara?", "respuesta": "Respuesta concisa basada en la nota." },
  { "pregunta": "¿Otra pregunta?", "respuesta": "Respuesta correspondiente." }
]`;

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const contenido = response.content[0];
    if (contenido.type !== "text") {
      throw new Error("Respuesta inesperada de Claude");
    }

    // Extrae el JSON del response (podría tener texto extra)
    const jsonMatch = contenido.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No se pudo parsear las FAQs generadas");
    }

    const faqs = JSON.parse(jsonMatch[0]) as Faq[];
    return faqs.slice(0, 4); // Máximo 4 preguntas
  } catch (error) {
    console.error("Error generando FAQs:", error);
    throw error;
  }
}
