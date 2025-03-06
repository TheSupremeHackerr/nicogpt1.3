import { NextRequest } from 'next/server'
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  try {
    return new ImageResponse(
      (
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #3B82F6, #8B5CF6)'
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: 128,
            fontWeight: 'bold',
            fontFamily: 'sans-serif'
          }}>
            N
          </div>
        </div>
      ),
      {
        width: 256,
        height: 256,
      }
    )
  } catch (e) {
    console.error(e)
    return new Response('Error generando logo', { status: 500 })
  }
}