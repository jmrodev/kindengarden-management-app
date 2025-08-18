"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { signUp } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creando cuenta...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-5 w-5" />
          Crear Cuenta
        </>
      )}
    </Button>
  )
}

export default function RegisterForm() {
  const [state, formAction] = useActionState(signUp, null)

  if (state?.success) {
    return (
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-green-800 mb-2">¡Cuenta Creada!</h3>
            <p className="text-green-700 mb-4">{state.success}</p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Ir al Login
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-serif font-bold text-gray-800">Crear Cuenta</CardTitle>
        <CardDescription className="text-lg text-gray-600">Solo para personal autorizado del jardín</CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  Nombre *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="Ej: María"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Apellido *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="Ej: González"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Contraseña *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700 font-medium">
                Rol *
              </Label>
              <Select name="role" required>
                <SelectTrigger className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500">
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="padre">Padre/Madre/Tutor</SelectItem>
                  <SelectItem value="maestro">Maestro/a</SelectItem>
                  <SelectItem value="directivo">Personal Directivo</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SubmitButton />

          <div className="text-center space-y-2">
            <p className="text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <Link href="/auth/login" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                Inicia sesión aquí
              </Link>
            </p>
            <p className="text-sm text-gray-500">
              <Link href="/" className="hover:text-green-600 hover:underline">
                ← Volver al inicio
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
