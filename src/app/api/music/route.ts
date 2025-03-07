import { NextRequest, NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';
import { consumeCredits, OPERATION_COSTS } from '@/lib/credits';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Verificar si hay suficientes créditos
    if (!consumeCredits(OPERATION_COSTS.musicGeneration)) {
      return NextResponse.json(
        { error: 'No tienes suficientes créditos para generar música' },
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
    
    // Generar música con MusicGen
    const response = await hf.textToSpeech({
      model: 'facebook/musicgen-small',
      inputs: prompt
    });

    // Convertir el blob a base64
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:audio/wav;base64,${base64}`;

    return NextResponse.json({ audio: dataUrl });
  } catch (error) {
    console.error('Error generando música:', error);
    return NextResponse.json(
      { error: 'Error al generar la música' },
      { status: 500 }
    );
  }
}
