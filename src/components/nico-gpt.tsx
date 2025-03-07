"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SendIcon, RefreshCwIcon, ImageIcon, MusicIcon } from 'lucide-react'
import { generateResponse } from '@/server/actions'
import NicoGPTLogo from './nico-gpt-logo'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { consumeCredits, OPERATION_COSTS } from '@/lib/credits'
import { toast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'

type Message = {
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'image' | 'audio'
  mediaUrl?: string
}

export default function NicoGPT() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('chat')
  const [credits, setCredits] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Cargar créditos al inicio
  useEffect(() => {
    fetchCredits()
  }, [])

  const fetchCredits = async () => {
    try {
      const response = await fetch('/api/credits')
      const data = await response.json()
      setCredits(data.credits)
    } catch (error) {
      console.error('Error fetching credits:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    // Verificar si hay suficientes créditos para el tipo de operación
    let cost = OPERATION_COSTS.chat
    if (activeTab === 'image') {
      cost = OPERATION_COSTS.imageGeneration
    } else if (activeTab === 'music') {
      cost = OPERATION_COSTS.musicGeneration
    }

    // Verificar créditos
    try {
      const response = await fetch('/api/credits')
      const data = await response.json()
      if (data.credits < cost) {
        toast({
          title: 'Sin créditos suficientes',
          description: `Necesitas ${cost} créditos para esta operación. Te quedan ${data.credits}.`,
          variant: 'destructive',
        })
        return
      }
    } catch (error) {
      console.error('Error checking credits:', error)
    }

    const userMessage: Message = { 
      role: 'user', 
      content: input,
      type: 'text'
    }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      if (activeTab === 'chat') {
        // Generar respuesta de chat
        const response = await generateResponse(userMessage.content, messages)
        setMessages((prev) => [...prev, { 
          role: 'assistant', 
          content: response,
          type: 'text'
        }])
      } else if (activeTab === 'image') {
        // Generar imagen
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: input }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: `Imagen generada para: "${input}"`,
            type: 'image',
            mediaUrl: data.image
          }])
        } else {
          throw new Error(data.error)
        }
      } else if (activeTab === 'music') {
        // Generar música
        const response = await fetch('/api/music', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: input }),
        })
        
        const data = await response.json()
        
        if (response.ok) {
          setMessages((prev) => [...prev, { 
            role: 'assistant', 
            content: `Música generada para: "${input}"`,
            type: 'audio',
            mediaUrl: data.audio
          }])
        } else {
          throw new Error(data.error)
        }
      }
      
      // Actualizar créditos después de la operación
      fetchCredits()
    } catch (error) {
      console.error('Error generating response:', error)
      setMessages((prev) => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Lo siento, encontré un error. Por favor, intenta de nuevo.',
          type: 'text'
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const resetChat = () => {
    setMessages([])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NicoGPTLogo className="h-6 w-6 text-primary" />
            <span>Chatea con NicoGPT</span>
          </div>
          <div className="flex items-center gap-2">
            {credits !== null && (
              <span className="text-sm text-muted-foreground">
                {credits} créditos
              </span>
            )}
            <Button variant="ghost" size="icon" onClick={resetChat} title="Reiniciar chat">
              <RefreshCwIcon className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-4 h-[50vh] overflow-y-auto p-4 rounded-lg bg-muted/50">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <NicoGPTLogo className="h-12 w-12 mb-4" />
              <p>¡Inicia una conversación con NicoGPT!</p>
              <p className="text-sm">Pregúntame lo que quieras, genera imágenes o música.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AI</AvatarFallback>
                    <AvatarImage src="/api/logo" />
                  </Avatar>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-muted text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.type === 'image' && message.mediaUrl && (
                    <div className="mt-2">
                      <img 
                        src={message.mediaUrl || "/placeholder.svg"} 
                        alt="Imagen generada" 
                        className="rounded-md max-w-full h-auto"
                      />
                    </div>
                  )}
                  {message.type === 'audio' && message.mediaUrl && (
                    <div className="mt-2">
                      <audio 
                        controls 
                        src={message.mediaUrl} 
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>Tú</AvatarFallback>
                    <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  </Avatar>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src="/api/logo" />
              </Avatar>
              <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted text-foreground">
                <p className="animate-pulse">Pensando...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full space-y-2">
          <Tabs 
            defaultValue="chat" 
            className="w-full"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="image">Imágenes</TabsTrigger>
              <TabsTrigger value="music">Música</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-0">
              <div className="text-xs text-muted-foreground mb-2">
                Costo: 1 crédito
              </div>
            </TabsContent>
            <TabsContent value="image" className="mt-0">
              <div className="text-xs text-muted-foreground mb-2">
                Costo: 10 créditos - Describe la imagen que quieres generar
              </div>
            </TabsContent>
            <TabsContent value="music" className="mt-0">
              <div className="text-xs text-muted-foreground mb-2">
                Costo: 15 créditos - Describe la música que quieres generar
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex gap-2">
            <Input
              placeholder={
                activeTab === 'chat' 
                  ? "Escribe tu mensaje..." 
                  : activeTab === 'image' 
                    ? "Describe la imagen que quieres crear..." 
                    : "Describe la música que quieres generar..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {activeTab === 'chat' ? (
                <SendIcon className="h-4 w-4" />
              ) : activeTab === 'image' ? (
                <ImageIcon className="h-4 w-4" />
              ) : (
                <MusicIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardFooter>
    </Card>
  )
}
