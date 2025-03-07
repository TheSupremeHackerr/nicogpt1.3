"use server";

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CREDITS_COOKIE_NAME = 'nicogpt_credits';
const LAST_RESET_COOKIE_NAME = 'nicogpt_last_reset';

function getAvailableCredits() {
    const cookieStore = cookies();
    const credits = parseInt(cookieStore.get(CREDITS_COOKIE_NAME)?.value || '0', 10);
    return credits;
}

function getPremiumStatus() {
    const cookieStore = cookies();
    return {
        isPremium: cookieStore.get('nicogpt_premium')?.value === 'true',
        promoCode: cookieStore.get('nicogpt_promo')?.value || null,
    };
}

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
