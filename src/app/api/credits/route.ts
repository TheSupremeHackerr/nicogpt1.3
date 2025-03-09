// app/api/credits/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CREDITS_COOKIE_NAME = 'nicogpt_credits'
const DEFAULT_CREDITS = 50

const getAvailableCredits = () => {
  const cookieStore = cookies()
  const credits = cookieStore.get(CREDITS_COOKIE_NAME)?.value
  
  if (!credits || isNaN(parseInt(credits, 10))) {
    return DEFAULT_CREDITS
  }

  return parseInt(credits, 10)
}

export async function GET() {
  try {
    const credits = getAvailableCredits()
    return NextResponse.json({ credits })
  } catch (error) {
    return NextResponse.json({ error: 'Error retrieving credits' }, { status: 500 })
  }
}
