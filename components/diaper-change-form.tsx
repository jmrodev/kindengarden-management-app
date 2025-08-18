"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Baby } from "lucide-react"

interface DiaperChangeFormProps {
  studentId: string
  onSuccess?: () => void
}

export default function DiaperChangeForm({ studentId, onSuccess }: DiaperChangeFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const changeData = {
      student_id: studentId,
      type: formData.get("type") as string,
      notes: formData.get("notes") as string,
      changed_at: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("diaper_changes").insert([changeData])

      if (error) throw error

      onSuccess?.()
      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error registering diaper change:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Baby className="h-5 w-5 text-orange-600" />
          Registrar Cambio de Pañal
        </CardTitle>
        <CardDescription>Registrar el cambio de pañal del alumno</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Cambio</Label>
            <Select name="type" required>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wet">Mojado</SelectItem>
                <SelectItem value="soiled">Sucio</SelectItem>
                <SelectItem value="both">Mojado y Sucio</SelectItem>
                <SelectItem value="routine">Rutina</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea id="notes" name="notes" placeholder="Observaciones adicionales..." className="min-h-[80px]" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
            {loading ? "Registrando..." : "Registrar Cambio"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
