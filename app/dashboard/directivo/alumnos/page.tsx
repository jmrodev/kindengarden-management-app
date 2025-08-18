import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Calendar, Users } from "lucide-react"

export default async function AlumnosManagement() {
  const supabase = createServerClient()

  const { data: alumnos } = await supabase
    .from("students")
    .select(`
      *,
      assigned_teacher:users!students_assigned_teacher_id_fkey(first_name, last_name),
      parent:users!students_parent_id_fkey(first_name, last_name, email)
    `)
    .order("created_at", { ascending: false })

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Gestión de Alumnos</h1>
          <p className="text-emerald-600 mt-2">Administrar información de todos los alumnos del jardín</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Alumno
        </Button>
      </div>

      <div className="grid gap-6">
        {alumnos?.map((alumno) => (
          <Card key={alumno.id} className="border-emerald-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-emerald-800">
                    {alumno.first_name} {alumno.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge className="bg-blue-100 text-blue-800">{calculateAge(alumno.birth_date)} años</Badge>
                    {alumno.assigned_teacher && (
                      <Badge className="bg-green-100 text-green-800">
                        Maestro: {alumno.assigned_teacher.first_name} {alumno.assigned_teacher.last_name}
                      </Badge>
                    )}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Nacimiento: {new Date(alumno.birth_date).toLocaleDateString()}</span>
                  </div>
                  {alumno.parent && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>
                        Padre: {alumno.parent.first_name} {alumno.parent.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Dirección:</span>
                    <span className="ml-2">{alumno.address || "No especificada"}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Teléfono emergencia:</span>
                    <span className="ml-2">{alumno.emergency_phone || "No especificado"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Fecha de ingreso:</span>
                    <span className="ml-2">{new Date(alumno.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Estado:</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">Activo</Badge>
                  </div>
                </div>
              </div>

              {alumno.medical_conditions && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium text-yellow-800">Condiciones médicas:</span>
                  <p className="text-sm text-yellow-700 mt-1">{alumno.medical_conditions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
