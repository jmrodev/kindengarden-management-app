import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, User, FileText } from "lucide-react"

export default async function SolicitudesManagement() {
  const supabase = createServerClient()

  const { data: solicitudes } = await supabase
    .from("change_requests")
    .select(`
      *,
      user:users!change_requests_user_id_fkey(first_name, last_name, email),
      student:students!change_requests_student_id_fkey(first_name, last_name)
    `)
    .order("created_at", { ascending: false })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: "Pendiente",
      approved: "Aprobada",
      rejected: "Rechazada",
    }
    return texts[status as keyof typeof texts] || status
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-emerald-800">Solicitudes de Cambios</h1>
        <p className="text-emerald-600 mt-2">Revisar y aprobar solicitudes de cambios de padres</p>
      </div>

      <div className="grid gap-6">
        {solicitudes?.map((solicitud) => (
          <Card key={solicitud.id} className="border-emerald-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-emerald-800 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Solicitud #{solicitud.id.slice(0, 8)}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusBadge(solicitud.status)}>{getStatusText(solicitud.status)}</Badge>
                    <span>•</span>
                    <span>{new Date(solicitud.created_at).toLocaleDateString()}</span>
                  </CardDescription>
                </div>
                {solicitud.status === "pending" && (
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Check className="h-4 w-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                      <X className="h-4 w-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">Solicitante:</span>
                      <span>
                        {solicitud.user?.first_name} {solicitud.user?.last_name}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{solicitud.user?.email}</span>
                    </div>
                    {solicitud.student && (
                      <div className="text-sm">
                        <span className="font-medium">Alumno:</span>
                        <span className="ml-2">
                          {solicitud.student.first_name} {solicitud.student.last_name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Tipo de cambio:</span>
                      <span className="ml-2 capitalize">{solicitud.request_type.replace("_", " ")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Fecha de solicitud: {new Date(solicitud.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm">
                    <span className="font-medium">Detalles de la solicitud:</span>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm">
                        {JSON.stringify(solicitud.request_data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                {solicitud.admin_notes && (
                  <div className="border-t pt-4">
                    <div className="text-sm">
                      <span className="font-medium">Notas del administrador:</span>
                      <p className="mt-2 p-3 bg-blue-50 rounded-lg text-blue-800">{solicitud.admin_notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
