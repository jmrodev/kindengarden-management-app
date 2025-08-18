import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Mail, Phone, Users } from "lucide-react"

export default async function PadresManagement() {
  const supabase = createServerClient()

  const { data: padres } = await supabase
    .from("users")
    .select(`
      *,
      children:students!students_parent_id_fkey(first_name, last_name, birth_date)
    `)
    .eq("role", "padre")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Gestión de Padres</h1>
          <p className="text-emerald-600 mt-2">Administrar información de padres y familias</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Padre
        </Button>
      </div>

      <div className="grid gap-6">
        {padres?.map((padre) => (
          <Card key={padre.id} className="border-emerald-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-emerald-800">
                    {padre.first_name} {padre.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge className="bg-orange-100 text-orange-800">{padre.children?.length || 0} hijo(s)</Badge>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{padre.email}</span>
                  </div>
                  {padre.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{padre.phone}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <span className="font-medium">Fecha de registro:</span>
                    <span className="ml-2">{new Date(padre.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {padre.children && padre.children.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Hijos:</span>
                    </div>
                    <div className="space-y-1">
                      {padre.children.map((child: any) => (
                        <div key={child.id} className="text-sm bg-gray-50 p-2 rounded">
                          <span className="font-medium">
                            {child.first_name} {child.last_name}
                          </span>
                          <span className="text-gray-600 ml-2">
                            ({new Date().getFullYear() - new Date(child.birth_date).getFullYear()} años)
                          </span>
                        </div>
                      ))}
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
