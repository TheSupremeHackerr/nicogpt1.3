"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

export default function CreditsDisplay() {
  const [credits, setCredits] = useState<number | null>(null)
  const [isPremium, setIsPremium] = useState(false)
  const [promoCode, setPromoCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Cargar créditos al inicio
  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits')
      const data = await response.json()
      setCredits(data.credits)
      setIsPremium(data.isPremium)
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const handleApplyPromoCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!promoCode.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: promoCode }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: '¡Éxito!',
          description: data.message,
        })
        setPromoCode('')
        fetchCredits() // Actualizar créditos
      } else {
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo aplicar el código promocional',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Tus Créditos</span>
          {isPremium && (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
              Premium
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">{credits !== null ? credits : '...'}</div>
          <p className="text-sm text-muted-foreground">
            {isPremium 
              ? 'Créditos restantes hoy (400 diarios)' 
              : 'Créditos restantes hoy (200 diarios)'}
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Costo por operación:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Chat: 1 crédito</li>
              <li>Generar imagen: 10 créditos</li>
              <li>Generar música: 15 créditos</li>
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleApplyPromoCode} className="w-full">
          <div className="flex gap-2">
            <Input
              placeholder="Código promocional"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !promoCode.trim()}>
              Aplicar
            </Button>
          </div>
        </form>
      </CardFooter>
      <Toaster />
    </Card>
  )
}
