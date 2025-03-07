import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { consumeCredits, OPERATION_COSTS } from '@/lib/credits';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Verificar si hay suficientes créditos
    if (!consumeCredits(OPERATION_COSTS.imageGeneration)) {
      return NextResponse.json(
        { error: 'No tienes suficientes créditos para generar una imagen' },
        { status: 402 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere un prompt válido' },
        { status: 400 }
      );
    }

    const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);
    
    // Generar imagen con Stable Diffusion
    const response = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-2-1',
      inputs: prompt,
      parameters: {
        negative_prompt: 'blurry, bad quality, distorted',
      }
    });

    // Convertir el blob a base64
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({ image: dataUrl });
  } catch (error) {
    console.error('Error generando imagen:', error);
    return NextResponse.json(
      { error: 'Error al generar la imagen' },
      { status: 500 }
    );
  }
}
