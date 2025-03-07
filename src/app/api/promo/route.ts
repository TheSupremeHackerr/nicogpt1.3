import { NextRequest, NextResponse } from 'next/server';
import { applyPromoCode, isValidPromoCode } from '@/lib/credits';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere un código promocional válido' },
        { status: 400 }
      );
    }

    if (!isValidPromoCode(code)) {
      return NextResponse.json(
        { error: 'Código promocional inválido' },
        { status: 400 }
      );
    }

    // Aplicar el código promocional
    applyPromoCode(code);

    return NextResponse.json({ 
      success: true, 
      message: '¡Código promocional aplicado con éxito!' 
    });
  } catch (error) {
    console.error('Error aplicando código promocional:', error);
    return NextResponse.json(
      { error: 'Error al aplicar el código promocional' },
      { status: 500 }
    );
  }
}
