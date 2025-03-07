// app/api/credits/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const CREDITS_COOKIE_NAME = 'nicogpt_credits'
const DEFAULT_CREDITS = 50

const getAvailableCredits = () => {
  const cookieStore = cookies()
  const credits = cookieStore.get(CREDITS_COOKIE_NAME)?.value
  return credits ? parseInt(credits, 10) : DEFAULT_CREDITS
}

export async function GET() {
  const credits = getAvailableCredits()
  return NextResponse.json({ credits })
}
