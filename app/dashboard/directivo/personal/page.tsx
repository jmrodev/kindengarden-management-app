import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Mail, Phone } from "lucide-react"

export default async function PersonalManagement() {
  const supabase = createServerClient()

  const { data: personal } = await supabase
    .from("users")
    .select("*")
    .in("role", ["maestro", "directivo", "admin"])
    .order("created_at", { ascending: false })

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "bg-red-100 text-red-800",
      directivo: "bg-purple-100 text-purple-800",
      maestro: "bg-blue-100 text-blue-800",
    }
    return variants[role as keyof typeof variants] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-emerald-800">Gestión de Personal</h1>
          <p className="text-emerald-600 mt-2">Administrar maestros, directivos y personal administrativo</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Personal
        </Button>
      </div>

      <div className="grid gap-6">
        {personal?.map((person) => (
          <Card key={person.id} className="border-emerald-200">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-emerald-800">
                    {person.first_name} {person.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Badge className={getRoleBadge(person.role)}>
                      {person.role.charAt(0).toUpperCase() + person.role.slice(1)}
                    </Badge>
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
                    <span>{person.email}</span>
                  </div>
                  {person.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{person.phone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Fecha de ingreso:</span>
                    <span className="ml-2">{new Date(person.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Estado:</span>
                    <Badge className="ml-2 bg-green-100 text-green-800">Activo</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
