"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface AddStudentFormProps {
  teachers: Array<{ id: string; first_name: string; last_name: string }>
  parents: Array<{ id: string; first_name: string; last_name: string; email: string }>
}

export default function AddStudentForm({ teachers, parents }: AddStudentFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const studentData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      birth_date: formData.get("birth_date") as string,
      address: formData.get("address") as string,
      emergency_phone: formData.get("emergency_phone") as string,
      medical_conditions: formData.get("medical_conditions") as string,
      allergies: formData.get("allergies") as string,
      blood_type: formData.get("blood_type") as string,
      insurance: formData.get("insurance") as string,
      parent_id: formData.get("parent_id") as string,
      assigned_teacher_id: formData.get("assigned_teacher_id") as string,
    }

    try {
      const { error } = await supabase.from("students").insert([studentData])

      if (error) throw error

      router.push("/dashboard/directivo/alumnos")
      router.refresh()
    } catch (error) {
      console.error("Error adding student:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Agregar Nuevo Alumno</CardTitle>
        <CardDescription>Complete la información del nuevo alumno</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Nombre</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Apellido</Label>
              <Input id="last_name" name="last_name" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
            <Input id="birth_date" name="birth_date" type="date" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" name="address" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_phone">Teléfono de Emergencia</Label>
            <Input id="emergency_phone" name="emergency_phone" type="tel" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent_id">Padre/Madre</Label>
              <Select name="parent_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar padre/madre" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id}>
                      {parent.first_name} {parent.last_name} ({parent.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assigned_teacher_id">Maestro Asignado</Label>
              <Select name="assigned_teacher_id">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar maestro" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Médica</h3>
            <div className="space-y-2">
              <Label htmlFor="medical_conditions">Condiciones Médicas</Label>
              <Textarea
                id="medical_conditions"
                name="medical_conditions"
                placeholder="Describir condiciones médicas especiales..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Textarea id="allergies" name="allergies" placeholder="Describir alergias conocidas..." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="blood_type">Grupo Sanguíneo</Label>
                <Select name="blood_type">
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grupo sanguíneo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Obra Social</Label>
                <Input id="insurance" name="insurance" placeholder="Nombre de la obra social" />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? "Guardando..." : "Agregar Alumno"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
