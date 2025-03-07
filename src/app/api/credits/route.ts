import { NextResponse } from 'next/server';
import { getAvailableCredits, getPremiumStatus } from '@/lib/credits';

export async function GET() {
  try {
    const credits = getAvailableCredits();
    const { isPremium, promoCode } = getPremiumStatus();
    
    return NextResponse.json({
      credits,
      isPremium,
      promoCode
    });
  } catch (error) {
    console.error('Error obteniendo créditos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los créditos' },
      { status: 500 }
    );
  }
}
