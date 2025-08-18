import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageSquare, AlertTriangle, Info, CheckCircle, Clock } from "lucide-react"

export default async function ComunicacionesPage() {
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

  // Get children IDs
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

  const childrenIds = children?.map((rel) => rel.students?.id).filter(Boolean) || []

  // Get communications (general for parents or specific for children)
  const { data: communications } = await supabase
    .from("communications")
    .select(`
      *,
      user_profiles!communications_sender_id_fkey (
        first_name,
        last_name,
        user_roles (
          name
        )
      ),
      students (
        first_name,
        last_name
      )
    `)
    .or(`target_role.eq.padre,target_student_id.in.(${childrenIds.join(",")})`)
    .order("created_at", { ascending: false })

  const unreadCount = communications?.filter((comm) => !comm.is_read).length || 0

  const getTypeIcon = (type: string, isUrgent: boolean) => {
    if (isUrgent) return <AlertTriangle className="h-5 w-5 text-red-600" />
    switch (type) {
      case "general":
        return <Info className="h-5 w-5 text-blue-600" />
      case "individual":
        return <MessageSquare className="h-5 w-5 text-green-600" />
      case "urgente":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />
    }
  }

  const getTypeColor = (type: string, isUrgent: boolean) => {
    if (isUrgent) return "destructive"
    switch (type) {
      case "general":
        return "default"
      case "individual":
        return "secondary"
      case "urgente":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <DashboardLayout userRole="padre" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Comunicaciones</h1>
            <p className="text-gray-600">Mensajes y avisos del jardín</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{communications?.length || 0}</div>
              <p className="text-xs text-blue-600">Comunicaciones</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Sin Leer</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{unreadCount}</div>
              <p className="text-xs text-orange-600">Pendientes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Urgentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">
                {communications?.filter((comm) => comm.is_urgent).length || 0}
              </div>
              <p className="text-xs text-red-600">Requieren atención</p>
            </CardContent>
          </Card>
        </div>

        {/* Communications List */}
        <div className="space-y-4">
          {communications && communications.length > 0 ? (
            communications.map((comm) => (
              <Card
                key={comm.id}
                className={`bg-white/80 backdrop-blur-sm transition-all hover:shadow-md ${
                  !comm.is_read ? "border-l-4 border-l-blue-500" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTypeIcon(comm.type, comm.is_urgent)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg text-gray-800">{comm.title}</CardTitle>
                          {!comm.is_read && (
                            <Badge variant="outline" className="text-xs">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>
                            De: {comm.user_profiles?.first_name} {comm.user_profiles?.last_name}
                            {comm.user_profiles?.user_roles?.name && (
                              <span className="text-gray-500 ml-1">({comm.user_profiles.user_roles.name})</span>
                            )}
                          </span>
                          <span>
                            {new Date(comm.created_at).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {comm.students && (
                            <span className="text-blue-600">
                              Para: {comm.students.first_name} {comm.students.last_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getTypeColor(comm.type, comm.is_urgent)} className="capitalize">
                        {comm.is_urgent ? "Urgente" : comm.type}
                      </Badge>
                      {comm.is_read && <CheckCircle className="h-4 w-4 text-green-600" />}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap">{comm.message}</p>
                  </div>
                  {!comm.is_read && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button size="sm" variant="outline">
                        Marcar como leído
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No hay comunicaciones</h3>
                <p className="text-gray-600">No tienes comunicaciones en este momento.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
