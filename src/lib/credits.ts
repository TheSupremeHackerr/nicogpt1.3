// Sistema de gestión de créditos
import { cookies } from 'next/headers';

const CREDITS_COOKIE_NAME = 'nicogpt_credits';
const LAST_RESET_COOKIE_NAME = 'nicogpt_last_reset';
const PROMO_CODE_COOKIE_NAME = 'nicogpt_promo_code';

// Códigos promocionales válidos
const PROMO_CODES: Record<string, number> = {
  'PREMIUM2025': 400,
  'NICOVIP': 400,
  'IAPOWER': 400,
  'CREATIVIDAD': 400,
  'BIENVENIDO': 300,
};

// Costo de cada operación
export const OPERATION_COSTS = {
  chat: 1,
  imageGeneration: 10,
  musicGeneration: 15,
};

// Verifica si un código promocional es válido
export function isValidPromoCode(code: string): boolean {
  return Object.keys(PROMO_CODES).includes(code.toUpperCase());
}

// Obtiene el límite de créditos basado en el código promocional
export function getCreditLimit(promoCode: string | null): number {
  if (promoCode && PROMO_CODES[promoCode.toUpperCase()]) {
    return PROMO_CODES[promoCode.toUpperCase()];
  }
  return 200; // Límite por defecto
}

// Resetea los créditos si es un nuevo día
function resetCreditsIfNewDay(cookieStore: any): void {
  const lastResetStr = cookieStore.get(LAST_RESET_COOKIE_NAME)?.value;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  
  if (!lastResetStr || parseInt(lastResetStr) < today) {
    const promoCode = cookieStore.get(PROMO_CODE_COOKIE_NAME)?.value || null;
    const creditLimit = getCreditLimit(promoCode);
    
    cookieStore.set(CREDITS_COOKIE_NAME, creditLimit.toString(), { 
      path: '/', 
      maxAge: 30 * 24 * 60 * 60 // 30 días
    });
    cookieStore.set(LAST_RESET_COOKIE_NAME, today.toString(), { 
      path: '/', 
      maxAge: 30 * 24 * 60 * 60 // 30 días
    });
  }
}

// Obtiene los créditos disponibles
export function getAvailableCredits(): number {
  const cookieStore = cookies();
  resetCreditsIfNewDay(cookieStore);
  
  const creditsStr = cookieStore.get(CREDITS_COOKIE_NAME)?.value;
  if (!creditsStr) {
    const promoCode = cookieStore.get(PROMO_CODE_COOKIE_NAME)?.value || null;
    const creditLimit = getCreditLimit(promoCode);
    cookieStore.set(CREDITS_COOKIE_NAME, creditLimit.toString(), { 
      path: '/', 
      maxAge: 30 * 24 * 60 * 60 // 30 días
    });
    return creditLimit;
  }
  
  return parseInt(creditsStr);
}

// Consume créditos para una operación
export function consumeCredits(amount: number): boolean {
  const cookieStore = cookies();
  const availableCredits = getAvailableCredits();
  
  if (availableCredits < amount) {
    return false; // No hay suficientes créditos
  }
  
  const newCredits = availableCredits - amount;
  cookieStore.set(CREDITS_COOKIE_NAME, newCredits.toString(), { 
    path: '/', 
    maxAge: 30 * 24 * 60 * 60 // 30 días
  });
  
  return true;
}

// Aplica un código promocional
export function applyPromoCode(code: string): boolean {
  if (!isValidPromoCode(code)) {
    return false;
  }
  
  const cookieStore = cookies();
  const upperCode = code.toUpperCase();
  
  cookieStore.set(PROMO_CODE_COOKIE_NAME, upperCode, { 
    path: '/', 
    maxAge: 365 * 24 * 60 * 60 // 1 año
  });
  
  // Resetea los créditos al nuevo límite
  const creditLimit = PROMO_CODES[upperCode];
  cookieStore.set(CREDITS_COOKIE_NAME, creditLimit.toString(), { 
    path: '/', 
    maxAge: 30 * 24 * 60 * 60 // 30 días
  });
  
  return true;
}

// Obtiene el estado premium
export function getPremiumStatus(): { isPremium: boolean, promoCode: string | null } {
  const cookieStore = cookies();
  const promoCode = cookieStore.get(PROMO_CODE_COOKIE_NAME)?.value || null;
  
  return {
    isPremium: promoCode !== null,
    promoCode
  };
}
