"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Syringe } from "lucide-react"

interface VaccineFormProps {
  studentId: string
  onSuccess?: () => void
}

export default function VaccineForm({ studentId, onSuccess }: VaccineFormProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const vaccineData = {
      student_id: studentId,
      vaccine_name: formData.get("vaccine_name") as string,
      date_administered: formData.get("date_administered") as string,
      next_dose_date: (formData.get("next_dose_date") as string) || null,
      administered_by: formData.get("administered_by") as string,
      notes: formData.get("notes") as string,
    }

    try {
      const { error } = await supabase.from("vaccines").insert([vaccineData])

      if (error) throw error

      onSuccess?.()
      // Reset form
      e.currentTarget.reset()
    } catch (error) {
      console.error("Error adding vaccine:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Syringe className="h-5 w-5 text-green-600" />
          Registrar Vacuna
        </CardTitle>
        <CardDescription>Agregar nueva vacuna al registro del alumno</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaccine_name">Nombre de la Vacuna</Label>
            <Input id="vaccine_name" name="vaccine_name" required placeholder="Ej: BCG, Triple viral..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_administered">Fecha de Aplicación</Label>
            <Input id="date_administered" name="date_administered" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_dose_date">Próxima Dosis (Opcional)</Label>
            <Input id="next_dose_date" name="next_dose_date" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="administered_by">Administrada por</Label>
            <Input id="administered_by" name="administered_by" placeholder="Nombre del médico o centro" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (Opcional)</Label>
            <Textarea id="notes" name="notes" placeholder="Observaciones adicionales..." className="min-h-[80px]" />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
            {loading ? "Registrando..." : "Registrar Vacuna"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
