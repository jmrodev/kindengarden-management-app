import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle, XCircle, Plus } from "lucide-react"

export default async function SolicitudesPage() {
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

  // Get change requests
  const { data: changeRequests } = await supabase
    .from("change_requests")
    .select(`
      *,
      user_profiles!change_requests_reviewed_by_fkey (
        first_name,
        last_name
      )
    `)
    .eq("requester_id", user.id)
    .order("created_at", { ascending: false })

  const pendingCount = changeRequests?.filter((req) => req.status === "pending").length || 0
  const approvedCount = changeRequests?.filter((req) => req.status === "approved").length || 0
  const rejectedCount = changeRequests?.filter((req) => req.status === "rejected").length || 0

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary"
      case "approved":
        return "default"
      case "rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "approved":
        return "Aprobada"
      case "rejected":
        return "Rechazada"
      default:
        return status
    }
  }

  const getTargetTypeText = (targetType: string) => {
    switch (targetType) {
      case "student":
        return "Datos del alumno"
      case "parent":
        return "Datos del padre/madre"
      case "authorized_pickup":
        return "Persona autorizada"
      default:
        return targetType
    }
  }

  return (
    <DashboardLayout userRole="padre" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Solicitudes de Cambios</h1>
            <p className="text-gray-600">Gestiona las solicitudes de modificación de datos</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{changeRequests?.length || 0}</div>
              <p className="text-xs text-blue-600">Solicitudes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">{pendingCount}</div>
              <p className="text-xs text-orange-600">En revisión</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Aprobadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">{approvedCount}</div>
              <p className="text-xs text-green-600">Completadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Rechazadas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-800">{rejectedCount}</div>
              <p className="text-xs text-red-600">No aprobadas</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {changeRequests && changeRequests.length > 0 ? (
            changeRequests.map((request) => (
              <Card key={request.id} className="bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStatusIcon(request.status)}
                      <div>
                        <CardTitle className="text-lg text-gray-800">
                          Cambio en {getTargetTypeText(request.target_type)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Campo: <span className="font-medium">{request.field_name}</span>
                        </CardDescription>
                        <div className="text-sm text-gray-600 mt-2">
                          Solicitado el{" "}
                          {new Date(request.created_at).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(request.status)}>{getStatusText(request.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current vs Requested Values */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Valor Actual</h4>
                      <p className="text-sm text-gray-600">{request.current_value || "No especificado"}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">Valor Solicitado</h4>
                      <p className="text-sm text-blue-700">{request.requested_value}</p>
                    </div>
                  </div>

                  {/* Reason */}
                  {request.reason && (
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <h4 className="font-medium text-yellow-800 mb-2">Motivo</h4>
                      <p className="text-sm text-yellow-700">{request.reason}</p>
                    </div>
                  )}

                  {/* Review Information */}
                  {request.status !== "pending" && (
                    <div className={`p-3 rounded-lg ${request.status === "approved" ? "bg-green-50" : "bg-red-50"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4
                          className={`font-medium ${request.status === "approved" ? "text-green-800" : "text-red-800"}`}
                        >
                          {request.status === "approved" ? "Aprobada" : "Rechazada"}
                        </h4>
                        {request.reviewed_at && (
                          <span
                            className={`text-xs ${request.status === "approved" ? "text-green-600" : "text-red-600"}`}
                          >
                            {new Date(request.reviewed_at).toLocaleDateString("es-ES")}
                          </span>
                        )}
                      </div>
                      {request.user_profiles && (
                        <p className={`text-sm ${request.status === "approved" ? "text-green-700" : "text-red-700"}`}>
                          Revisado por: {request.user_profiles.first_name} {request.user_profiles.last_name}
                        </p>
                      )}
                      {request.review_notes && (
                        <p
                          className={`text-sm mt-2 ${
                            request.status === "approved" ? "text-green-700" : "text-red-700"
                          }`}
                        >
                          {request.review_notes}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No hay solicitudes</h3>
                <p className="text-gray-600 mb-4">No has realizado ninguna solicitud de cambio de datos.</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Solicitud
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
