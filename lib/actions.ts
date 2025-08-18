"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signIn(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Datos del formulario faltantes" }
  }

  const email = formData.get("email")
  const password = formData.get("password")

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos" }
  }

  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toString(),
      password: password.toString(),
    })

    if (error) {
      return { error: error.message }
    }

    // Get user profile to determine redirect
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role_id, user_roles(name)")
        .eq("id", user.id)
        .single()

      revalidatePath("/dashboard")
      return { success: true, role: profile?.user_roles?.name || "padre" }
    }

    return { success: true }
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Datos del formulario faltantes" }
  }

  const email = formData.get("email")
  const password = formData.get("password")
  const firstName = formData.get("firstName")
  const lastName = formData.get("lastName")
  const role = formData.get("role") || "padre"

  if (!email || !password || !firstName || !lastName) {
    return { error: "Todos los campos son requeridos" }
  }

  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.toString(),
      password: password.toString(),
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${process.env.NEXT_PUBLIC_SUPABASE_URL}/dashboard`,
        data: {
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          role: role.toString(),
        },
      },
    })

    if (error) {
      return { error: error.message }
    }

    // Create user profile if user was created
    if (data.user) {
      // Get role ID
      const { data: roleData } = await supabase.from("user_roles").select("id").eq("name", role.toString()).single()

      if (roleData) {
        await supabase.from("user_profiles").insert({
          id: data.user.id,
          email: email.toString(),
          first_name: firstName.toString(),
          last_name: lastName.toString(),
          role_id: roleData.id,
        })
      }
    }

    return { success: "Revisa tu email para confirmar tu cuenta." }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/auth/login")
}

export async function getUserProfile() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("user_profiles")
    .select(`
      *,
      user_roles (
        name,
        description
      )
    `)
    .eq("id", user.id)
    .single()

  return profile
}

export async function submitEnrollment(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Datos del formulario faltantes" }
  }

  const studentFirstName = formData.get("studentFirstName")
  const studentLastName = formData.get("studentLastName")
  const studentBirthDate = formData.get("studentBirthDate")
  const parentFirstName = formData.get("parentFirstName")
  const parentLastName = formData.get("parentLastName")
  const parentEmail = formData.get("parentEmail")
  const parentPhone = formData.get("parentPhone")
  const parentAddress = formData.get("parentAddress")

  // Validar campos requeridos
  if (
    !studentFirstName ||
    !studentLastName ||
    !studentBirthDate ||
    !parentFirstName ||
    !parentLastName ||
    !parentEmail ||
    !parentPhone
  ) {
    return { error: "Todos los campos marcados con * son obligatorios" }
  }

  // Validar edad del niño (2-5 años)
  const birthDate = new Date(studentBirthDate.toString())
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  if (age < 2 || age > 5) {
    return { error: "El niño debe tener entre 2 y 5 años para inscribirse" }
  }

  const supabase = createClient()

  try {
    // Verificar si ya existe una inscripción con el mismo email
    const { data: existingEnrollment } = await supabase
      .from("public_enrollments")
      .select("id")
      .eq("parent_email", parentEmail.toString())
      .single()

    if (existingEnrollment) {
      return { error: "Ya existe una inscripción con este email" }
    }

    // Generar número de lotería único
    const lotteryNumber = Math.floor(Math.random() * 10000) + 1

    // Insertar inscripción
    const { data, error } = await supabase
      .from("public_enrollments")
      .insert({
        student_first_name: studentFirstName.toString(),
        student_last_name: studentLastName.toString(),
        student_birth_date: studentBirthDate.toString(),
        parent_first_name: parentFirstName.toString(),
        parent_last_name: parentLastName.toString(),
        parent_email: parentEmail.toString(),
        parent_phone: parentPhone.toString(),
        parent_address: parentAddress?.toString() || null,
        lottery_number: lotteryNumber,
      })
      .select()
      .single()

    if (error) {
      console.error("Enrollment error:", error)
      return { error: "Error al procesar la inscripción. Inténtalo de nuevo." }
    }

    return {
      success: true,
      studentName: `${studentFirstName} ${studentLastName}`,
      enrollmentId: data.lottery_number,
    }
  } catch (error) {
    console.error("Enrollment error:", error)
    return { error: "Ocurrió un error inesperado. Inténtalo de nuevo." }
  }
}
