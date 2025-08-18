import { createClient, isSupabaseConfigured } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "@/components/login-form"

export default async function LoginPage() {
  // If Supabase is not configured, show setup message directly
  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Conecta Supabase para comenzar</h1>
      </div>
    )
  }

  // Check if user is already logged in
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-green-700">
                Jardín de Infantes "Pequeños Exploradores"
              </h1>
              <p className="text-green-600">Portal de Acceso</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <LoginForm />
      </div>
    </div>
  )
}
