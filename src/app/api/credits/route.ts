import { NextResponse } from 'next/server'

export const OPERATION_COSTS = {
  chat: 1,
  imageGeneration: 10,
  musicGeneration: 15,
}

export async function GET() {
  const credits = 50 // Aquí debes manejar el sistema real de créditos (por ejemplo, base de datos)

  return NextResponse.json({
    credits,
  })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { action } = body

  let newCredits = 50 // Maneja aquí la actualización de créditos

  switch (action) {
    case 'consume':
      newCredits -= OPERATION_COSTS.chat
      break
    case 'image':
      newCredits -= OPERATION_COSTS.imageGeneration
      break
    case 'music':
      newCredits -= OPERATION_COSTS.musicGeneration
      break
    default:
      break
  }

  return NextResponse.json({
    credits: newCredits,
  })
}

