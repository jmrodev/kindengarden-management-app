import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, Send, Users, Eye, Clock } from "lucide-react"

export default async function ComunicacionesPage() {
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

  // Get assigned students for individual communications
  const { data: students } = await supabase
    .from("students")
    .select(`
      id,
      first_name,
      last_name,
      parent_student_relations (
        user_profiles (
          first_name,
          last_name,
          email
        )
      )
    `)
    .eq("teacher_id", user.id)
    .eq("is_active", true)

  // Get sent communications
  const { data: sentCommunications } = await supabase
    .from("communications")
    .select(`
      *,
      students (
        first_name,
        last_name
      )
    `)
    .eq("sender_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10)

  const totalSent = sentCommunications?.length || 0
  const unreadCount = sentCommunications?.filter((comm) => !comm.is_read).length || 0
  const urgentCount = sentCommunications?.filter((comm) => comm.is_urgent).length || 0

  const getTypeColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) return "destructive"
    switch (type) {
      case "general":
        return "default"
      case "individual":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "general":
        return "General"
      case "individual":
        return "Individual"
      case "urgente":
        return "Urgente"
      default:
        return type
    }
  }

  return (
    <DashboardLayout userRole="maestro" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Comunicaciones</h1>
            <p className="text-gray-600">Envía mensajes a padres y gestiona comunicaciones</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Comunicación
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Mis Alumnos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{students?.length || 0}</div>
              <p className="text-xs text-blue-600">Familias a cargo</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Enviadas</CardTitle>
              <Send className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{totalSent}</div>
              <p className="text-xs text-green-600">Este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Sin Leer</CardTitle>
              <Eye className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{unreadCount}</div>
              <p className="text-xs text-orange-600">Pendientes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Urgentes</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{urgentCount}</div>
              <p className="text-xs text-red-600">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Communication Templates */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Plantillas Rápidas</CardTitle>
            <CardDescription>Envía comunicaciones comunes con un clic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  title: "Recordatorio de Materiales",
                  description: "Solicitar materiales para actividades",
                  type: "general",
                },
                {
                  title: "Informe Diario",
                  description: "Resumen del día del alumno",
                  type: "individual",
                },
                {
                  title: "Felicitaciones",
                  description: "Reconocer logros del niño",
                  type: "individual",
                },
                {
                  title: "Reunión de Padres",
                  description: "Convocar a reunión grupal",
                  type: "general",
                },
                {
                  title: "Evento Especial",
                  description: "Invitar a actividad especial",
                  type: "general",
                },
                {
                  title: "Seguimiento Médico",
                  description: "Consulta sobre salud del niño",
                  type: "individual",
                },
              ].map((template, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800">{template.title}</h4>
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <Button size="sm" variant="outline" className="w-full bg-transparent">
                    Usar Plantilla
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Communications */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Comunicaciones Recientes
            </CardTitle>
            <CardDescription>Mensajes enviados recientemente</CardDescription>
          </CardHeader>
          <CardContent>
            {sentCommunications && sentCommunications.length > 0 ? (
              <div className="space-y-4">
                {sentCommunications.map((comm) => (
                  <div key={comm.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-800">{comm.title}</h4>
                          <Badge variant={getTypeColor(comm.type, comm.is_urgent)}>
                            {comm.is_urgent ? "Urgente" : getTypeText(comm.type)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{comm.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>
                            {new Date(comm.created_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {comm.students && (
                            <span>
                              Para: {comm.students.first_name} {comm.students.last_name}
                            </span>
                          )}
                          {comm.target_role && <span>Para: {comm.target_role}s</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {comm.is_read ? (
                          <Badge variant="outline" className="text-xs">
                            Leído
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Sin leer
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No hay comunicaciones</h3>
                <p className="text-gray-600 mb-4">Aún no has enviado ninguna comunicación.</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Enviar Primera Comunicación
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
