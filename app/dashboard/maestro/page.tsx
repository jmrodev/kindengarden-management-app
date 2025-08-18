import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Calendar, BookOpen, MessageSquare, Baby, CheckCircle, AlertCircle, Clock } from "lucide-react"
import Link from "next/link"

export default async function MaestroDashboardPage() {
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

  // Get assigned students
  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      first_name,
      last_name,
      birth_date,
      is_active,
      medical_conditions,
      allergies
    `)
    .eq("teacher_id", user.id)
    .eq("is_active", true)

  // Get today's attendance
  const today = new Date().toISOString().split("T")[0]
  const studentIds = students?.map((s) => s.id) || []

  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .in("student_id", studentIds)
    .eq("date", today)

  // Get recent diaper changes
  const { data: recentDiaperChanges } = await supabase
    .from("diaper_changes")
    .select(`
      *,
      students (
        first_name,
        last_name
      )
    `)
    .in("student_id", studentIds)
    .gte("change_time", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order("change_time", { ascending: false })
    .limit(5)

  // Get pending communications
  const { data: pendingCommunications } = await supabase
    .from("communications")
    .select("*")
    .eq("sender_id", user.id)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(3)

  const presentCount = todayAttendance?.filter((a) => a.status === "presente").length || 0
  const absentCount = todayAttendance?.filter((a) => a.status === "ausente").length || 0
  const lateCount = todayAttendance?.filter((a) => a.status === "tardanza").length || 0
  const notRecordedCount = (students?.length || 0) - (todayAttendance?.length || 0)

  return (
    <DashboardLayout userRole="maestro" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-green-200">
          <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">
            Bienvenido/a, Maestro/a {profile.first_name}
          </h1>
          <p className="text-gray-600">Panel de control para gestionar tus alumnos y actividades diarias.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Mis Alumnos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{students?.length || 0}</div>
              <p className="text-xs text-blue-600">Asignados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Presentes Hoy</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{presentCount}</div>
              <p className="text-xs text-green-600">De {students?.length || 0} alumnos</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Sin Registrar</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{notRecordedCount}</div>
              <p className="text-xs text-orange-600">Asistencia pendiente</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Cambios Pañal</CardTitle>
              <Baby className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{recentDiaperChanges?.length || 0}</div>
              <p className="text-xs text-purple-600">Últimas 24h</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Attendance Overview */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5 text-green-600" />
                Asistencia de Hoy
              </CardTitle>
              <CardDescription>Estado actual de tus alumnos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">{presentCount}</div>
                  <div className="text-xs text-green-600">Presentes</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-800">{absentCount}</div>
                  <div className="text-xs text-red-600">Ausentes</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-800">{lateCount}</div>
                  <div className="text-xs text-orange-600">Tardanzas</div>
                </div>
              </div>

              {notRecordedCount > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {notRecordedCount} alumnos sin registro de asistencia
                    </span>
                  </div>
                </div>
              )}

              <Link href="/dashboard/maestro/asistencia">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Calendar className="h-4 w-4 mr-2" />
                  Registrar Asistencia
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Students with Special Needs */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <AlertCircle className="h-5 w-5 text-red-600" />
                Alumnos con Necesidades Especiales
              </CardTitle>
              <CardDescription>Condiciones médicas y alergias</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {students?.filter((s) => s.medical_conditions || s.allergies).length ? (
                students
                  .filter((s) => s.medical_conditions || s.allergies)
                  .slice(0, 4)
                  .map((student) => (
                    <div key={student.id} className="p-3 bg-red-50 rounded-lg">
                      <div className="font-medium text-gray-800">
                        {student.first_name} {student.last_name}
                      </div>
                      {student.medical_conditions && (
                        <div className="text-xs text-red-700 mt-1">Condición: {student.medical_conditions}</div>
                      )}
                      {student.allergies && (
                        <div className="text-xs text-red-700 mt-1">Alergia: {student.allergies}</div>
                      )}
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay alumnos con condiciones especiales registradas</p>
              )}
              <Link href="/dashboard/maestro/alumnos">
                <Button variant="outline" className="w-full bg-transparent">
                  Ver Todos los Alumnos
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Diaper Changes */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Baby className="h-5 w-5 text-purple-600" />
                Cambios de Pañal Recientes
              </CardTitle>
              <CardDescription>Últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentDiaperChanges && recentDiaperChanges.length > 0 ? (
                recentDiaperChanges.map((change) => (
                  <div key={change.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">
                        {change.students?.first_name} {change.students?.last_name}
                      </div>
                      <div className="text-xs text-gray-600">
                        {new Date(change.change_time).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {change.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay cambios registrados hoy</p>
              )}
              <Button variant="outline" className="w-full bg-transparent">
                <Baby className="h-4 w-4 mr-2" />
                Registrar Cambio
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Acciones Rápidas
              </CardTitle>
              <CardDescription>Tareas frecuentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/maestro/asistencia">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Calendar className="h-4 w-4 mr-2" />
                  Registrar Asistencia
                </Button>
              </Link>
              <Link href="/dashboard/maestro/actividades">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Planificar Actividades
                </Button>
              </Link>
              <Link href="/dashboard/maestro/comunicaciones">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Comunicación
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Baby className="h-4 w-4 mr-2" />
                Registro de Vacunas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
