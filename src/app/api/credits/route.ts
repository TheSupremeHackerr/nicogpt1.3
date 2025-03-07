// src/app/api/credits/route.ts

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CREDITS_COOKIE_NAME = 'nicogpt_credits'
const LAST_RESET_COOKIE_NAME = 'nicogpt_last_reset'

// Función para obtener los créditos almacenados en las cookies
const getCredits = () => {
  const cookieStore = cookies()
  const credits = cookieStore.get(CREDITS_COOKIE_NAME)?.value
  return credits ? parseInt(credits, 10) : 50 // Valor por defecto de 50 créditos
}

// Función para actualizar los créditos en las cookies
const setCredits = (credits: number) => {
  const cookieStore = cookies()
  cookieStore.set(CREDITS_COOKIE_NAME, credits.toString())
}

export async function GET() {
  const credits = getCredits()
  return NextResponse.json({ credits })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action } = body

  let credits = getCredits()

  switch (action) {
    case 'consume':
      credits -= 1
      break
    case 'image':
      credits -= 10
      break
    case 'music':
      credits -= 15
      break
    default:
      break
  }

  setCredits(credits)

  return NextResponse.json({ credits })
}

