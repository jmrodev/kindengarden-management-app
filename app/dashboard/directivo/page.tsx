import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, UserCheck, Calendar, TrendingUp, AlertCircle } from "lucide-react"

export default async function DirectivoDashboard() {
  const supabase = createServerClient()

  // Obtener estadísticas generales
  const [{ count: totalAlumnos }, { count: totalMaestros }, { count: totalPadres }, { count: solicitudesPendientes }] =
    await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "maestro"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "padre"),
      supabase.from("change_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ])

  // Obtener asistencia de hoy
  const today = new Date().toISOString().split("T")[0]
  const { data: asistenciaHoy } = await supabase.from("attendance").select("present").eq("date", today)

  const presentesToday = asistenciaHoy?.filter((a) => a.present).length || 0
  const totalRegistrosHoy = asistenciaHoy?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Dashboard Directivo</h1>
        <p className="text-emerald-600 mt-2">Panel de administración del jardín de infantes</p>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Alumnos</CardTitle>
            <GraduationCap className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-800">{totalAlumnos}</div>
            <p className="text-xs text-emerald-600">Alumnos registrados</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Personal</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{totalMaestros}</div>
            <p className="text-xs text-blue-600">Maestros activos</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Familias</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{totalPadres}</div>
            <p className="text-xs text-orange-600">Padres registrados</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Solicitudes</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{solicitudesPendientes}</div>
            <p className="text-xs text-red-600">Pendientes de revisión</p>
          </CardContent>
        </Card>
      </div>

      {/* Asistencia del día */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              Asistencia de Hoy
            </CardTitle>
            <CardDescription>Resumen de asistencia del día actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Presentes:</span>
                <span className="text-lg font-bold text-green-600">{presentesToday}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total registros:</span>
                <span className="text-lg font-bold">{totalRegistrosHoy}</span>
              </div>
              {totalRegistrosHoy > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(presentesToday / totalRegistrosHoy) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>Accesos directos a funciones principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/dashboard/directivo/personal"
                className="p-3 bg-emerald-50 rounded-lg text-center hover:bg-emerald-100 transition-colors"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Personal</span>
              </a>
              <a
                href="/dashboard/directivo/alumnos"
                className="p-3 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <GraduationCap className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Alumnos</span>
              </a>
              <a
                href="/dashboard/directivo/padres"
                className="p-3 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors"
              >
                <UserCheck className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                <span className="text-sm font-medium text-orange-700">Padres</span>
              </a>
              <a
                href="/dashboard/directivo/solicitudes"
                className="p-3 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors"
              >
                <AlertCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
                <span className="text-sm font-medium text-red-700">Solicitudes</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
