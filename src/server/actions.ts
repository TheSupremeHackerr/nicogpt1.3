"use server"

import { HfInference } from "@huggingface/inference"

type Message = {
  role: "user" | "assistant"
  content: string
}

export async function generateResponse(prompt: string, previousMessages: Message[]): Promise<string> {
  try {
    const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN)
    
    // Crear un contexto a partir de mensajes previos
    const context = previousMessages
      .map((msg) => `${msg.role === 'user' ? 'Humano' : 'Asistente'}: ${msg.content}`)
      .join('\n')
    
    // Preparar el prompt completo con contexto
    const systemPrompt = "Eres NicoGPT, un asistente de IA amigable y útil. Responde siempre en español de manera clara y concisa."
    const fullPrompt = context 
      ? `${systemPrompt}\n${context}\nHumano: ${prompt}\nAsistente:`
      : `${systemPrompt}\nHumano: ${prompt}\nAsistente:`
    
    // Llamar a la API de Hugging Face
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: fullPrompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        do_sample: true,
        return_full_text: false
      }
    })
    
    // Limpiar la respuesta
    let generatedText = response.generated_text.trim()
    
    // Eliminar cualquier "Humano:" o prompts adicionales que puedan estar en la respuesta
    if (generatedText.includes('Humano:')) {
      generatedText = generatedText.split('Humano:')[0].trim()
    }
    
    return generatedText
  } catch (error) {
    console.error('Error al llamar a la API de Hugging Face:', error)
    throw new Error('No se pudo generar una respuesta')
  }
}
