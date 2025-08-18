import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Baby, Calendar, Heart, Shield, Phone, MapPin, User, Edit } from "lucide-react"
import Link from "next/link"

export default async function HijosPage() {
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

  // Get detailed children information
  const { data: children } = await supabase
    .from("parent_student_relations")
    .select(`
      relationship,
      is_primary,
      students (
        id,
        first_name,
        last_name,
        birth_date,
        gender,
        medical_conditions,
        allergies,
        emergency_contact_name,
        emergency_contact_phone,
        enrollment_date,
        is_active,
        user_profiles!students_teacher_id_fkey (
          first_name,
          last_name,
          phone,
          email
        )
      )
    `)
    .eq("parent_id", user.id)

  // Get authorized pickups for each child
  const childrenIds = children?.map((rel) => rel.students?.id).filter(Boolean) || []
  const { data: authorizedPickups } = await supabase
    .from("authorized_pickups")
    .select("*")
    .in("student_id", childrenIds)
    .eq("is_active", true)

  return (
    <DashboardLayout userRole="padre" userName={`${profile.first_name} ${profile.last_name}`}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800">Mis Hijos</h1>
            <p className="text-gray-600">Información detallada de tus hijos en el jardín</p>
          </div>
        </div>

        {children && children.length > 0 ? (
          <div className="space-y-6">
            {children.map((relation) => {
              const child = relation.students
              if (!child) return null

              const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear()
              const childPickups = authorizedPickups?.filter((pickup) => pickup.student_id === child.id) || []

              return (
                <Card key={child.id} className="bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Baby className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-800">
                            {child.first_name} {child.last_name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span>{age} años</span>
                            <Badge variant={child.is_active ? "default" : "secondary"}>
                              {child.is_active ? "Activo" : "Inactivo"}
                            </Badge>
                            {relation.is_primary && <Badge variant="outline">Contacto Principal</Badge>}
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Solicitar Cambios
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Información Personal
                        </h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de nacimiento:</span>
                            <span className="font-medium">{new Date(child.birth_date).toLocaleDateString()}</span>
                          </div>
                          {child.gender && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Género:</span>
                              <span className="font-medium capitalize">{child.gender}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de inscripción:</span>
                            <span className="font-medium">{new Date(child.enrollment_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Relación:</span>
                            <span className="font-medium capitalize">{relation.relationship}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Maestro/a Asignado
                        </h3>
                        {child.user_profiles ? (
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nombre:</span>
                              <span className="font-medium">
                                {child.user_profiles.first_name} {child.user_profiles.last_name}
                              </span>
                            </div>
                            {child.user_profiles.email && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{child.user_profiles.email}</span>
                              </div>
                            )}
                            {child.user_profiles.phone && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Teléfono:</span>
                                <span className="font-medium">{child.user_profiles.phone}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No asignado</p>
                        )}
                      </div>
                    </div>

                    {/* Medical Information */}
                    {(child.medical_conditions || child.allergies) && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Información Médica
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {child.medical_conditions && (
                            <div className="p-3 bg-yellow-50 rounded-lg">
                              <h4 className="font-medium text-yellow-800 mb-2">Condiciones Médicas</h4>
                              <p className="text-sm text-yellow-700">{child.medical_conditions}</p>
                            </div>
                          )}
                          {child.allergies && (
                            <div className="p-3 bg-red-50 rounded-lg">
                              <h4 className="font-medium text-red-800 mb-2">Alergias</h4>
                              <p className="text-sm text-red-700">{child.allergies}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Emergency Contact */}
                    {(child.emergency_contact_name || child.emergency_contact_phone) && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          Contacto de Emergencia
                        </h3>
                        <div className="p-3 bg-orange-50 rounded-lg">
                          <div className="space-y-2 text-sm">
                            {child.emergency_contact_name && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Nombre:</span>
                                <span className="font-medium">{child.emergency_contact_name}</span>
                              </div>
                            )}
                            {child.emergency_contact_phone && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Teléfono:</span>
                                <span className="font-medium">{child.emergency_contact_phone}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Authorized Pickups */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Personas Autorizadas para Retirar
                        </h3>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Gestionar
                        </Button>
                      </div>
                      {childPickups.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {childPickups.map((pickup) => (
                            <div key={pickup.id} className="p-3 bg-green-50 rounded-lg">
                              <div className="space-y-1 text-sm">
                                <div className="font-medium text-gray-800">{pickup.authorized_person_name}</div>
                                {pickup.authorized_person_phone && (
                                  <div className="text-gray-600">{pickup.authorized_person_phone}</div>
                                )}
                                {pickup.relationship && (
                                  <div className="text-gray-500 capitalize">{pickup.relationship}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No hay personas autorizadas registradas</p>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                      <Link href={`/dashboard/padre/asistencia?child=${child.id}`}>
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Ver Asistencia
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm">
                        <Shield className="h-4 w-4 mr-2" />
                        Ver Vacunas
                      </Button>
                      <Button variant="outline" size="sm">
                        <Baby className="h-4 w-4 mr-2" />
                        Cambio de Pañales
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <Baby className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">No tienes hijos registrados</h3>
              <p className="text-gray-600 mb-4">
                Contacta con la administración del jardín para registrar a tus hijos.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
