import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, CheckCircle, XCircle, Clock, User } from "lucide-react"

export default async function AsistenciaPage({
  searchParams,
}: {
  searchParams: { child?: string; month?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const profile = await getUserProfile()

  if (!profile || profile.user_roles?.name !== "padre") {
    redirect("/auth/login")
  }

  // Get children
  const { data: children } = await supabase
    .from("parent_student_relations")
    .select(`
      students (
        id,
        first_name,
        last_name
      )
    `)
    .eq("parent_id", user.id)

  const selectedChildId = searchParams.child || children?.[0]?.students?.id
  const selectedMonth = searchParams.month || new Date().toISOString().slice(0, 7)

  // Get attendance records for selected child and month
  const { data: attendance } = await supabase
    .from("attendance")
    .select(`
      *,
      students (
        first_name,
        last_name
      )
    `)
    .eq("student_id", selectedChildId)
    .gte("date", `${selectedMonth}-01`)
    .lt("date", `${selectedMonth}-32`)
    .order("date", { ascending: false })

  // Calculate statistics
  const totalDays = attendance?.length || 0
  const presentDays = attendance?.filter((a) => a.status === "presente").length || 0
  const absentDays = attendance?.filter((a) => a.status === "ausente").length || 0
  const lateDays = attendance?.filter((a) => a.status === "tardanza").length || 0

  const selectedChild = children?.find((rel) => rel.students?.id === selectedChildId)?.students

  return (
    <DashboardLayout userRole="padre" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Asistencia</h1>
            <p className="text-gray-600">Registro de asistencia de tus hijos</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hijo/a</label>
                <Select value={selectedChildId || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un hijo/a" />
                  </SelectTrigger>
                  <SelectContent>
                    {children?.map((relation) => {
                      const child = relation.students
                      if (!child) return null
                      return (
                        <SelectItem key={child.id} value={child.id}>
                          {child.first_name} {child.last_name}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mes</label>
                <Select value={selectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const date = new Date()
                      date.setMonth(i)
                      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
                      return (
                        <SelectItem key={value} value={value}>
                          {date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedChild && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700">Total Días</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{totalDays}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-green-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-700">Presente</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800">{presentDays}</div>
                  <p className="text-xs text-green-600">
                    {totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-red-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-700">Ausente</CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800">{absentDays}</div>
                  <p className="text-xs text-red-600">
                    {totalDays > 0 ? Math.round((absentDays / totalDays) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-700">Tardanza</CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-800">{lateDays}</div>
                  <p className="text-xs text-orange-600">
                    {totalDays > 0 ? Math.round((lateDays / totalDays) * 100) : 0}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Attendance Records */}
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {selectedChild.first_name} {selectedChild.last_name}
                </CardTitle>
                <CardDescription>
                  Registro de asistencia para{" "}
                  {new Date(selectedMonth + "-01").toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attendance && attendance.length > 0 ? (
                  <div className="space-y-3">
                    {attendance.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {record.status === "presente" && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {record.status === "ausente" && <XCircle className="h-5 w-5 text-red-600" />}
                            {record.status === "tardanza" && <Clock className="h-5 w-5 text-orange-600" />}
                            <div>
                              <p className="font-medium text-gray-800">
                                {new Date(record.date).toLocaleDateString("es-ES", {
                                  weekday: "long",
                                  day: "numeric",
                                  month: "long",
                                })}
                              </p>
                              {record.arrival_time && (
                                <p className="text-sm text-gray-600">Llegada: {record.arrival_time}</p>
                              )}
                              {record.departure_time && (
                                <p className="text-sm text-gray-600">Salida: {record.departure_time}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              record.status === "presente"
                                ? "default"
                                : record.status === "tardanza"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className="capitalize"
                          >
                            {record.status}
                          </Badge>
                          {record.picked_up_by && (
                            <p className="text-xs text-gray-500 mt-1">Retirado por: {record.picked_up_by}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">No hay registros</h3>
                    <p className="text-gray-600">No se encontraron registros de asistencia para este período.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
