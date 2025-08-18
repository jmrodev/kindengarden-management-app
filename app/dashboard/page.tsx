import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getUserProfile } from "@/lib/actions"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile to determine role-based redirect
  const profile = await getUserProfile()

  if (!profile) {
    redirect("/auth/login")
  }

  // Redirect based on user role
  switch (profile.user_roles?.name) {
    case "padre":
      redirect("/dashboard/padre")
    case "maestro":
      redirect("/dashboard/maestro")
    case "directivo":
    case "admin":
      redirect("/dashboard/directivo")
    default:
      redirect("/auth/login")
  }
}
