import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Calendar, Users, Clock, Target } from "lucide-react"

export default async function ActividadesPage() {
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

  // Get assigned students count
  const { data: students } = await supabase
    .from("students")
    .select("id")
    .eq("teacher_id", user.id)
    .eq("is_active", true)

  // Mock activities data (in a real app, this would come from a database)
  const activities = [
    {
      id: 1,
      title: "Pintura con Dedos",
      description: "Actividad de expresión artística usando pintura dactilar",
      type: "Arte",
      duration: 45,
      participants: 12,
      materials: ["Pintura dactilar", "Papel grande", "Delantales", "Toallas húmedas"],
      objectives: ["Desarrollar creatividad", "Mejorar motricidad fina", "Expresión emocional"],
      date: "2024-12-20",
      status: "planificada",
    },
    {
      id: 2,
      title: "Cuento Interactivo",
      description: "Lectura participativa con dramatización",
      type: "Lenguaje",
      duration: 30,
      participants: 15,
      materials: ["Libro ilustrado", "Títeres", "Disfraces simples"],
      objectives: ["Fomentar amor por la lectura", "Desarrollar vocabulario", "Estimular imaginación"],
      date: "2024-12-20",
      status: "completada",
    },
    {
      id: 3,
      title: "Juegos de Movimiento",
      description: "Actividades físicas y coordinación",
      type: "Educación Física",
      duration: 60,
      participants: 18,
      materials: ["Pelotas", "Aros", "Conos", "Música"],
      objectives: ["Desarrollar motricidad gruesa", "Trabajo en equipo", "Coordinación"],
      date: "2024-12-21",
      status: "planificada",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "planificada":
        return "secondary"
      case "en_progreso":
        return "default"
      case "completada":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "planificada":
        return "Planificada"
      case "en_progreso":
        return "En Progreso"
      case "completada":
        return "Completada"
      default:
        return status
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Arte":
        return "bg-purple-100 text-purple-800"
      case "Lenguaje":
        return "bg-blue-100 text-blue-800"
      case "Educación Física":
        return "bg-green-100 text-green-800"
      case "Matemáticas":
        return "bg-orange-100 text-orange-800"
      case "Ciencias":
        return "bg-teal-100 text-teal-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout userRole="maestro" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Actividades y Planificación</h1>
            <p className="text-gray-600">Planifica y gestiona las actividades para tus alumnos</p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Actividad
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Alumnos</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">{students?.length || 0}</div>
              <p className="text-xs text-blue-600">Participantes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">
                {activities.filter((a) => a.status === "planificada").length}
              </div>
              <p className="text-xs text-green-600">Planificadas</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">Completadas</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-800">
                {activities.filter((a) => a.status === "completada").length}
              </div>
              <p className="text-xs text-orange-600">Este mes</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">Tiempo Total</CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-800">
                {activities.reduce((total, activity) => total + activity.duration, 0)}
              </div>
              <p className="text-xs text-purple-600">Minutos planificados</p>
            </CardContent>
          </Card>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl text-gray-800">{activity.title}</CardTitle>
                        <Badge className={getTypeColor(activity.type)}>{activity.type}</Badge>
                      </div>
                      <CardDescription className="text-base mb-2">{activity.description}</CardDescription>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(activity.date).toLocaleDateString("es-ES")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {activity.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {activity.participants} niños
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant={getStatusColor(activity.status)}>{getStatusText(activity.status)}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Objectives */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-600" />
                    Objetivos
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.objectives.map((objective, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {objective}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Materials */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Materiales Necesarios</h4>
                  <div className="flex flex-wrap gap-2">
                    {activity.materials.map((material, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {material}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    Duplicar
                  </Button>
                  {activity.status === "planificada" && (
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Iniciar Actividad
                    </Button>
                  )}
                  {activity.status === "completada" && (
                    <Button variant="outline" size="sm">
                      Ver Resultados
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Activity Templates */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Plantillas de Actividades</CardTitle>
            <CardDescription>Crea actividades rápidamente usando estas plantillas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Rincón de Arte", type: "Arte", duration: "30-45 min" },
                { name: "Hora del Cuento", type: "Lenguaje", duration: "20-30 min" },
                { name: "Juego Libre", type: "Social", duration: "45-60 min" },
                { name: "Actividad Sensorial", type: "Desarrollo", duration: "30-40 min" },
                { name: "Música y Movimiento", type: "Educación Física", duration: "30-45 min" },
                { name: "Exploración Científica", type: "Ciencias", duration: "40-50 min" },
              ].map((template, index) => (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.type}</p>
                  <p className="text-xs text-gray-500">{template.duration}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
