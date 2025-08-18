"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Student {
  id: string
  first_name: string
  last_name: string
  birth_date: string
}

interface AttendanceRecord {
  id?: string
  student_id: string
  date: string
  status: string
  arrival_time?: string
  departure_time?: string
  picked_up_by?: string
  notes?: string
}

interface AttendanceFormProps {
  students: Student[]
  existingAttendance: AttendanceRecord[]
  teacherId: string
  date: string
}

export function AttendanceForm({ students, existingAttendance, teacherId, date }: AttendanceFormProps) {
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>(() => {
    const initial: Record<string, AttendanceRecord> = {}

    students.forEach((student) => {
      const existing = existingAttendance.find((a) => a.student_id === student.id)
      initial[student.id] = existing || {
        student_id: student.id,
        date,
        status: "presente",
        arrival_time: "",
        departure_time: "",
        picked_up_by: "",
        notes: "",
      }
    })

    return initial
  })

  const [saving, setSaving] = useState<Record<string, boolean>>({})
  const supabase = createClient()

  const updateAttendance = async (studentId: string, field: keyof AttendanceRecord, value: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }))

    // Auto-save after a short delay
    setSaving((prev) => ({ ...prev, [studentId]: true }))

    setTimeout(async () => {
      try {
        const record = { ...attendance[studentId], [field]: value }

        if (record.id) {
          // Update existing record
          await supabase
            .from("attendance")
            .update({
              status: record.status,
              arrival_time: record.arrival_time || null,
              departure_time: record.departure_time || null,
              picked_up_by: record.picked_up_by || null,
              notes: record.notes || null,
            })
            .eq("id", record.id)
        } else {
          // Create new record
          const { data } = await supabase
            .from("attendance")
            .insert({
              student_id: studentId,
              date,
              status: record.status,
              arrival_time: record.arrival_time || null,
              departure_time: record.departure_time || null,
              picked_up_by: record.picked_up_by || null,
              notes: record.notes || null,
              recorded_by: teacherId,
            })
            .select()
            .single()

          if (data) {
            setAttendance((prev) => ({
              ...prev,
              [studentId]: { ...prev[studentId], id: data.id },
            }))
          }
        }
      } catch (error) {
        console.error("Error saving attendance:", error)
      } finally {
        setSaving((prev) => ({ ...prev, [studentId]: false }))
      }
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "presente":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "ausente":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "tardanza":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "presente":
        return "default"
      case "ausente":
        return "destructive"
      case "tardanza":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-4">
      {students.map((student) => {
        const record = attendance[student.id]
        const isSaving = saving[student.id]
        const age = new Date().getFullYear() - new Date(student.birth_date).getFullYear()

        return (
          <div key={student.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {getStatusIcon(record.status)}
                <div>
                  <h3 className="font-medium text-gray-800">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{age} años</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isSaving && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Save className="h-3 w-3 animate-pulse" />
                    Guardando...
                  </div>
                )}
                <Badge variant={getStatusColor(record.status)} className="capitalize">
                  {record.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`status-${student.id}`} className="text-sm font-medium">
                  Estado
                </Label>
                <Select value={record.status} onValueChange={(value) => updateAttendance(student.id, "status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="presente">Presente</SelectItem>
                    <SelectItem value="ausente">Ausente</SelectItem>
                    <SelectItem value="tardanza">Tardanza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {record.status !== "ausente" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor={`arrival-${student.id}`} className="text-sm font-medium">
                      Hora de llegada
                    </Label>
                    <Input
                      id={`arrival-${student.id}`}
                      type="time"
                      value={record.arrival_time || ""}
                      onChange={(e) => updateAttendance(student.id, "arrival_time", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`departure-${student.id}`} className="text-sm font-medium">
                      Hora de salida
                    </Label>
                    <Input
                      id={`departure-${student.id}`}
                      type="time"
                      value={record.departure_time || ""}
                      onChange={(e) => updateAttendance(student.id, "departure_time", e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`pickup-${student.id}`} className="text-sm font-medium">
                      Retirado por
                    </Label>
                    <Input
                      id={`pickup-${student.id}`}
                      type="text"
                      placeholder="Nombre de quien retira"
                      value={record.picked_up_by || ""}
                      onChange={(e) => updateAttendance(student.id, "picked_up_by", e.target.value)}
                      className="bg-white"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <Label htmlFor={`notes-${student.id}`} className="text-sm font-medium">
                Notas adicionales
              </Label>
              <Textarea
                id={`notes-${student.id}`}
                placeholder="Observaciones del día..."
                value={record.notes || ""}
                onChange={(e) => updateAttendance(student.id, "notes", e.target.value)}
                className="bg-white"
                rows={2}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
