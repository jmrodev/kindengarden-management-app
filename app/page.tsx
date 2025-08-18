import { EnrollmentForm } from "@/components/enrollment-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, BookOpen, Shield, LogIn } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-green-700 mb-2">
                Jardín de Infantes "Pequeños Exploradores"
              </h1>
              <p className="text-green-600 text-lg">Un lugar donde los sueños crecen y la imaginación florece</p>
            </div>
            <div className="hidden md:block">
              <Link href="/auth/login">
                <Button variant="outline" className="border-green-600 text-green-700 hover:bg-green-50 bg-transparent">
                  <LogIn className="h-4 w-4 mr-2" />
                  Acceso al Sistema
                </Button>
              </Link>
            </div>
          </div>
          {/* Mobile login button */}
          <div className="md:hidden mt-4 text-center">
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-700 hover:bg-green-50 bg-transparent"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Acceso al Sistema
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-6">
              Inscripciones Abiertas 2025
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Brindaremos a tu hijo un ambiente seguro, cálido y estimulante donde podrá desarrollar todo su potencial
              mientras se divierte aprendiendo.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-4 rounded-full mb-3">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Cuidado Personalizado</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Grupos Reducidos</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-100 p-4 rounded-full mb-3">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Educación Integral</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-orange-100 p-4 rounded-full mb-3">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Ambiente Seguro</span>
              </div>
            </div>
          </div>
        </section>

        {/* Enrollment Form Section */}
        <section className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-serif font-bold text-gray-800">Formulario de Inscripción</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Completa los datos para participar en el sorteo de vacantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentForm />
            </CardContent>
          </Card>
        </section>

        {/* Information Section */}
        <section className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-green-700">Proceso de Inscripción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-gray-700">Completa el formulario de inscripción</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-gray-700">Participas automáticamente en el sorteo</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-gray-700">Te contactaremos si resultas seleccionado</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <p className="text-gray-700">Recibirás acceso al portal de padres</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-blue-700">Información Importante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700">
              <p>
                <strong>Edades:</strong> Aceptamos niños de 2 a 5 años
              </p>
              <p>
                <strong>Horarios:</strong> Lunes a Viernes de 8:00 a 17:00
              </p>
              <p>
                <strong>Sorteo:</strong> Se realizará el 15 de diciembre de 2024
              </p>
              <p>
                <strong>Inicio de clases:</strong> Marzo de 2025
              </p>
              <p>
                <strong>Vacantes disponibles:</strong> 60 lugares
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold mb-4">Jardín de Infantes "Pequeños Exploradores"</h3>
            <p className="text-green-200 mb-2">Dirección: Av. Educación 123, Ciudad</p>
            <p className="text-green-200 mb-2">Teléfono: (011) 1234-5678</p>
            <p className="text-green-200">Email: info@pequenosexploradores.edu.ar</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
