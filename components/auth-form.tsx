"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/supabase-auth-provider"
import { Loader2 } from "lucide-react"

export default function AuthForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const { toast } = useToast()
  const { signInWithOtp } = useAuth()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage("")

    const { error } = await signInWithOtp(email)

    if (error) {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive",
      })
    } else {
      setMessage("¡Revisa tu correo electrónico para el enlace de inicio de sesión!")
      toast({
        title: "Enlace enviado",
        description: "Revisa tu correo electrónico para iniciar sesión.",
      })
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#121212]">
      <Card className="w-full max-w-md bg-[#1a1a1a] text-white border-[#333]">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#00BFFF]">Iniciar Sesión</CardTitle>
          <CardDescription className="text-gray-400">
            Ingresa tu correo electrónico para recibir un enlace mágico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-white">
                Correo Electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-[#2a2a2a] text-white border-[#333]"
              />
            </div>
            <Button type="submit" className="w-full bg-[#00BFFF] hover:bg-[#0099CC] text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando...
                </>
              ) : (
                "Enviar Enlace Mágico"
              )}
            </Button>
            {message && <p className="text-center text-sm text-green-400">{message}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
