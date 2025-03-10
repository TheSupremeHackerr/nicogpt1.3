"use server";

import { cookies } from "next/headers";
import { HfInference } from "@huggingface/inference";

const CREDITS_COOKIE_NAME = "nicogpt_credits";
const DEFAULT_CREDITS = 50;

function getAvailableCredits(): number {
  const cookieStore = cookies();
  const creditsStr = cookieStore.get(CREDITS_COOKIE_NAME)?.value;
  return creditsStr ? parseInt(creditsStr, 10) : DEFAULT_CREDITS;
}

function setCredits(newCredits: number) {
  const cookieStore = cookies();
  // Actualiza la cookie con el nuevo valor de créditos
  cookieStore.set(CREDITS_COOKIE_NAME, newCredits.toString());
}

function consumeCredits(amount: number): boolean {
  const currentCredits = getAvailableCredits();
  if (currentCredits < amount) {
    return false;
  }
  setCredits(currentCredits - amount);
  return true;
}

const OPERATION_COSTS = {
  chat: 1,
  imageGeneration: 10,
  musicGeneration: 15,
};

type Message = {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "image" | "audio";
  mediaUrl?: string;
};

export async function generateResponse(
  prompt: string,
  previousMessages: Message[]
): Promise<string> {
  try {
    // Verificar y restar créditos para una operación de chat
    if (!consumeCredits(OPERATION_COSTS.chat)) {
      throw new Error("No tienes suficientes créditos para esta operación");
    }

    const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);

    // Crear un contexto a partir de mensajes previos (solo texto)
    const context = previousMessages
      .filter((msg) => msg.type === "text" || !msg.type)
      .map((msg) => `${msg.role === "user" ? "Humano" : "Asistente"}: ${msg.content}`)
      .join("\n");

    // Preparar el prompt completo con contexto
    const systemPrompt =
      "Eres NicoGPT, un asistente de IA amigable y útil. Responde siempre en español de manera clara y concisa.";
    const fullPrompt = context
      ? `${systemPrompt}\n${context}\nHumano: ${prompt}\nAsistente:`
      : `${systemPrompt}\nHumano: ${prompt}\nAsistente:`;

    // Llamar a la API de Hugging Face para generar el texto
    const response = await hf.textGeneration({
      model: "deepseek-ai/DeepSeek-R1",
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false,
      },
    });

    // Limpiar la respuesta
    let generatedText = response.generated_text.trim();

    // Eliminar cualquier fragmento adicional (por ejemplo, si aparece "Humano:" en la respuesta)
    if (generatedText.includes("Humano:")) {
      generatedText = generatedText.split("Humano:")[0].trim();
    }

    return generatedText;
  } catch (error) {
    console.error("Error al llamar a la API de Hugging Face:", error);
    throw new Error("No se pudo generar una respuesta");
  }
}
