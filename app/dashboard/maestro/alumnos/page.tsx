import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Search, Baby, Heart, Shield, Phone, Calendar, Edit, Eye } from "lucide-react"

export default async function AlumnosPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getUserProfile()

  if (!profile || profile.user_roles?.name !== "maestro") {
    redirect("/auth/login")
  }

  // Get assigned students with parent information
  const { data: students } = await supabase
    .from("students")
    .select(`
      *,
      parent_student_relations (
        relationship,
        is_primary,
        user_profiles (
          first_name,
          last_name,
          email,
          phone
        )
      )
    `)
    .eq("teacher_id", user.id)
    .order("first_name", { ascending: true })

  // Get recent attendance for each student
  const studentIds = students?.map((s) => s.id) || []
  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select("student_id, status, date")
    .in("student_id", studentIds)
    .gte("date", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0])
    .order("date", { ascending: false })

  const getAttendanceRate = (studentId: string) => {
    const studentAttendance = recentAttendance?.filter((a) => a.student_id === studentId) || []
    const presentDays = studentAttendance.filter((a) => a.status === "presente").length
    const totalDays = studentAttendance.length
    return totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
  }

  return (
    <DashboardLayout userRole="maestro" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Mis Alumnos</h1>
            <p className="text-gray-600">Gestiona la información de tus alumnos asignados</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {students?.length || 0} alumnos asignados
          </Badge>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Buscar Alumnos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre..."
                    className="pl-10 bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Shield className="h-4 w-4 mr-2" />
                Solo con Condiciones Médicas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        {students && students.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {students.map((student) => {
              const age = new Date().getFullYear() - new Date(student.birth_date).getFullYear()
              const primaryParent = student.parent_student_relations?.find((rel) => rel.is_primary)
              const attendanceRate = getAttendanceRate(student.id)

              return (
                <Card key={student.id} className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Baby className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-800">
                            {student.first_name} {student.last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span>{age} años</span>
                            <Badge variant={student.is_active ? "default" : "secondary"}>
                              {student.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Fecha de nacimiento:</span>
                        <div className="font-medium">{new Date(student.birth_date).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Asistencia (7 días):</span>
                        <div className="font-medium text-green-600">{attendanceRate}%</div>
                      </div>
                      {student.gender && (
                        <div>
                          <span className="text-gray-600">Género:</span>
                          <div className="font-medium capitalize">{student.gender}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Inscripción:</span>
                        <div className="font-medium">{new Date(student.enrollment_date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    {/* Medical Information */}
                    {(student.medical_conditions || student.allergies) && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-red-600" />
                          Información Médica
                        </h4>
                        {student.medical_conditions && (
                          <div className="p-2 bg-yellow-50 rounded text-sm">
                            <span className="font-medium text-yellow-800">Condiciones: </span>
                            <span className="text-yellow-700">{student.medical_conditions}</span>
                          </div>
                        )}
                        {student.allergies && (
                          <div className="p-2 bg-red-50 rounded text-sm">
                            <span className="font-medium text-red-800">Alergias: </span>
                            <span className="text-red-700">{student.allergies}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {(student.emergency_contact_name || student.emergency_contact_phone) && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          <Phone className="h-4 w-4 text-orange-600" />
                          Contacto de Emergencia
                        </h4>
                        <div className="p-2 bg-orange-50 rounded text-sm">
                          {student.emergency_contact_name && (
                            <div>
                              <span className="font-medium text-orange-800">Nombre: </span>
                              <span className="text-orange-700">{student.emergency_contact_name}</span>
                            </div>
                          )}
                          {student.emergency_contact_phone && (
                            <div>
                              <span className="font-medium text-orange-800">Teléfono: </span>
                              <span className="text-orange-700">{student.emergency_contact_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Primary Parent */}
                    {primaryParent && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-800 flex items-center gap-2">
                          <Heart className="h-4 w-4 text-pink-600" />
                          Contacto Principal
                        </h4>
                        <div className="p-2 bg-pink-50 rounded text-sm">
                          <div>
                            <span className="font-medium text-pink-800">
                              {primaryParent.user_profiles?.first_name} {primaryParent.user_profiles?.last_name}
                            </span>
                            <span className="text-pink-600 ml-2 capitalize">({primaryParent.relationship})</span>
                          </div>
                          {primaryParent.user_profiles?.email && (
                            <div className="text-pink-700">{primaryParent.user_profiles.email}</div>
                          )}
                          {primaryParent.user_profiles?.phone && (
                            <div className="text-pink-700">{primaryParent.user_profiles.phone}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
                      <Button variant="outline" size="sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        Asistencia
                      </Button>
                      <Button variant="outline" size="sm">
                        <Baby className="h-3 w-3 mr-1" />
                        Pañales
                      </Button>
                      <Button variant="outline" size="sm">
                        <Shield className="h-3 w-3 mr-1" />
                        Vacunas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No tienes alumnos asignados</h3>
              <p className="text-gray-600">Contacta con la administración para que te asignen alumnos a tu cargo.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
