import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Baby, Calendar, MessageSquare, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function PadreDashboardPage() {
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

  // Get children information
  const { data: children } = await supabase
    .from("parent_student_relations")
    .select(`
      students (
        id,
        first_name,
        last_name,
        birth_date,
        is_active,
        user_profiles!students_teacher_id_fkey (
          first_name,
          last_name
        )
      )
    `)
    .eq("parent_id", user.id)

  // Get recent attendance
  const childrenIds = children?.map((rel) => rel.students?.id).filter(Boolean) || []
  const { data: recentAttendance } = await supabase
    .from("attendance")
    .select(`
      *,
      students (
        first_name,
        last_name
      )
    `)
    .in("student_id", childrenIds)
    .order("date", { ascending: false })
    .limit(5)

  // Get unread communications
  const { data: communications } = await supabase
    .from("communications")
    .select("*")
    .or(`target_role.eq.padre,target_student_id.in.(${childrenIds.join(",")})`)
    .eq("is_read", false)
    .order("created_at", { ascending: false })
    .limit(3)

  // Get pending change requests
  const { data: changeRequests } = await supabase
    .from("change_requests")
    .select("*")
    .eq("requester_id", user.id)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(3)

  return (
    <DashboardLayout userRole="padre" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-green-200">
          <h1 className="text-2xl font-serif font-bold text-gray-800 mb-2">Bienvenido/a, {profile.first_name}</h1>
          <p className="text-gray-600">Aquí puedes ver toda la información importante sobre tus hijos en el jardín.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Mis Hijos</CardTitle>
              <Baby className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{children?.length || 0}</div>
              <p className="text-xs text-blue-600">Inscriptos en el jardín</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Asistencia Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {recentAttendance?.filter(
                  (a) => a.date === new Date().toISOString().split("T")[0] && a.status === "presente",
                ).length || 0}
              </div>
              <p className="text-xs text-green-600">Presentes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Comunicaciones</CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{communications?.length || 0}</div>
              <p className="text-xs text-orange-600">Sin leer</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Solicitudes</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">{changeRequests?.length || 0}</div>
              <p className="text-xs text-purple-600">Pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Children Overview */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Baby className="h-5 w-5 text-blue-600" />
                Mis Hijos
              </CardTitle>
              <CardDescription>Información general de tus hijos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {children && children.length > 0 ? (
                children.map((relation) => {
                  const child = relation.students
                  if (!child) return null

                  const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear()

                  return (
                    <div key={child.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {child.first_name} {child.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{age} años</p>
                        {child.user_profiles && (
                          <p className="text-xs text-gray-500">
                            Maestro/a: {child.user_profiles.first_name} {child.user_profiles.last_name}
                          </p>
                        )}
                      </div>
                      <Badge variant={child.is_active ? "default" : "secondary"}>
                        {child.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No tienes hijos registrados</p>
              )}
              <Link
                href="/dashboard/padre/hijos"
                className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Ver Detalles
              </Link>
            </CardContent>
          </Card>

          {/* Recent Communications */}
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Comunicaciones Recientes
              </CardTitle>
              <CardDescription>Mensajes del jardín</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {communications && communications.length > 0 ? (
                communications.map((comm) => (
                  <div key={comm.id} className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">{comm.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{comm.message}</p>
                        <p className="text-xs text-gray-500 mt-2">{new Date(comm.created_at).toLocaleDateString()}</p>
                      </div>
                      {comm.is_urgent && (
                        <Badge variant="destructive" className="ml-2">
                          Urgente
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No hay comunicaciones nuevas</p>
              )}
              <Link
                href="/dashboard/padre/comunicaciones"
                className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Ver Todas
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Clock className="h-5 w-5 text-green-600" />
              Actividad Reciente
            </CardTitle>
            <CardDescription>Últimos registros de asistencia</CardDescription>
          </CardHeader>
          <CardContent>
            {recentAttendance && recentAttendance.length > 0 ? (
              <div className="space-y-3">
                {recentAttendance.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {attendance.status === "presente" ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-800">
                          {attendance.students?.first_name} {attendance.students?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{new Date(attendance.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge
                      variant={attendance.status === "presente" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {attendance.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay registros de asistencia recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
