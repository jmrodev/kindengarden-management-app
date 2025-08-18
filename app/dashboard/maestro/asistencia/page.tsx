import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AttendanceForm } from "@/components/attendance-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, CheckCircle, XCircle, Clock } from "lucide-react"

export default async function AsistenciaPage() {
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
    .select("id, first_name, last_name, birth_date")
    .eq("teacher_id", user.id)
    .eq("is_active", true)
    .order("first_name", { ascending: true })

  // Get today's attendance
  const today = new Date().toISOString().split("T")[0]
  const { data: todayAttendance } = await supabase
    .from("attendance")
    .select("*")
    .in("student_id", students?.map((s) => s.id) || [])
    .eq("date", today)

  const presentCount = todayAttendance?.filter((a) => a.status === "presente").length || 0
  const absentCount = todayAttendance?.filter((a) => a.status === "ausente").length || 0
  const lateCount = todayAttendance?.filter((a) => a.status === "tardanza").length || 0
  const totalStudents = students?.length || 0
  const recordedCount = todayAttendance?.length || 0

  return (
    <DashboardLayout userRole="maestro" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Registro de Asistencia</h1>
            <p className="text-gray-600">
              Registra la asistencia diaria de tus alumnos -{" "}
              {new Date().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge variant={recordedCount === totalStudents ? "default" : "secondary"}>
            {recordedCount}/{totalStudents} registrados
          </Badge>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Alumnos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{totalStudents}</div>
              <p className="text-xs text-blue-600">Asignados</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Presentes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{presentCount}</div>
              <p className="text-xs text-green-600">
                {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Ausentes</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{absentCount}</div>
              <p className="text-xs text-red-600">
                {totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Tardanzas</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{lateCount}</div>
              <p className="text-xs text-orange-600">
                {totalStudents > 0 ? Math.round((lateCount / totalStudents) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Form */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Registro de Asistencia
            </CardTitle>
            <CardDescription>
              Marca la asistencia de cada alumno. Los cambios se guardan automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {students && students.length > 0 ? (
              <AttendanceForm
                students={students}
                existingAttendance={todayAttendance || []}
                teacherId={user.id}
                date={today}
              />
            ) : (
              <div className="text-center py-8">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No tienes alumnos asignados</h3>
                <p className="text-gray-600">Contacta con la administración para que te asignen alumnos a tu cargo.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
