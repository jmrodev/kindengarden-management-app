import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Phone, MapPin, Heart, Syringe, Baby, Users, Edit } from "lucide-react"
import { notFound } from "next/navigation"

export default async function AlumnoProfile({ params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data: alumno } = await supabase
    .from("students")
    .select(`
      *,
      assigned_teacher:users!students_assigned_teacher_id_fkey(first_name, last_name, email),
      parent:users!students_parent_id_fkey(first_name, last_name, email, phone),
      vaccines(*),
      diaper_changes(*),
      authorized_pickups(*)
    `)
    .eq("id", params.id)
    .single()

  if (!alumno) {
    notFound()
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">
            {alumno.first_name} {alumno.last_name}
          </h1>
          <p className="text-emerald-600 mt-2">Perfil completo del alumno</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Edit className="h-4 w-4 mr-2" />
          Editar Información
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="medico">Médico</TabsTrigger>
          <TabsTrigger value="vacunas">Vacunas</TabsTrigger>
          <TabsTrigger value="panales">Pañales</TabsTrigger>
          <TabsTrigger value="retiro">Retiro</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Edad:</span>
                    <p className="text-lg font-semibold">{calculateAge(alumno.birth_date)} años</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Fecha de nacimiento:</span>
                    <p className="text-lg font-semibold">{new Date(alumno.birth_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{alumno.address || "Dirección no especificada"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Emergencia: {alumno.emergency_phone || "No especificado"}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Información Familiar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {alumno.parent && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600">Padre/Madre:</span>
                    <p className="text-lg font-semibold">
                      {alumno.parent.first_name} {alumno.parent.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{alumno.parent.email}</p>
                    {alumno.parent.phone && <p className="text-sm text-gray-600">{alumno.parent.phone}</p>}
                  </div>
                )}
                {alumno.assigned_teacher && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-600">Maestro asignado:</span>
                    <p className="text-lg font-semibold">
                      {alumno.assigned_teacher.first_name} {alumno.assigned_teacher.last_name}
                    </p>
                    <p className="text-sm text-gray-600">{alumno.assigned_teacher.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medico" className="space-y-6">
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Información Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alumno.medical_conditions ? (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-medium text-yellow-800 mb-2">Condiciones Médicas:</h4>
                  <p className="text-yellow-700">{alumno.medical_conditions}</p>
                </div>
              ) : (
                <p className="text-gray-600">No se han registrado condiciones médicas especiales.</p>
              )}

              {alumno.allergies && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800 mb-2">Alergias:</h4>
                  <p className="text-red-700">{alumno.allergies}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Grupo sanguíneo:</span>
                  <p className="text-lg font-semibold">{alumno.blood_type || "No especificado"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Obra social:</span>
                  <p className="text-lg font-semibold">{alumno.insurance || "No especificada"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vacunas" className="space-y-6">
          <Card className="border-green-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Syringe className="h-5 w-5 text-green-600" />
                  Registro de Vacunas
                </CardTitle>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Agregar Vacuna
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alumno.vaccines && alumno.vaccines.length > 0 ? (
                <div className="space-y-4">
                  {alumno.vaccines.map((vaccine: any) => (
                    <div key={vaccine.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{vaccine.vaccine_name}</p>
                        <p className="text-sm text-gray-600">
                          Aplicada: {new Date(vaccine.date_administered).toLocaleDateString()}
                        </p>
                        {vaccine.next_dose_date && (
                          <p className="text-sm text-blue-600">
                            Próxima dosis: {new Date(vaccine.next_dose_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-800">Aplicada</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No se han registrado vacunas.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="panales" className="space-y-6">
          <Card className="border-orange-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-orange-600" />
                  Registro de Cambio de Pañales
                </CardTitle>
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                  Registrar Cambio
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alumno.diaper_changes && alumno.diaper_changes.length > 0 ? (
                <div className="space-y-3">
                  {alumno.diaper_changes.slice(0, 10).map((change: any) => (
                    <div key={change.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">
                          {new Date(change.changed_at).toLocaleDateString()}{" "}
                          {new Date(change.changed_at).toLocaleTimeString()}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">Tipo: {change.type}</p>
                        {change.notes && <p className="text-sm text-gray-600">Notas: {change.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No se han registrado cambios de pañales.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retiro" className="space-y-6">
          <Card className="border-purple-200">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Personas Autorizadas para Retiro
                </CardTitle>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Agregar Persona
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {alumno.authorized_pickups && alumno.authorized_pickups.length > 0 ? (
                <div className="space-y-4">
                  {alumno.authorized_pickups.map((person: any) => (
                    <div key={person.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-purple-800">
                            {person.first_name} {person.last_name}
                          </p>
                          <p className="text-sm text-purple-600">Relación: {person.relationship}</p>
                          <p className="text-sm text-purple-600">Teléfono: {person.phone}</p>
                          {person.dni && <p className="text-sm text-purple-600">DNI: {person.dni}</p>}
                        </div>
                        <Badge className="bg-purple-100 text-purple-800">Autorizado</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No se han registrado personas autorizadas para retiro.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
