"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, LogIn } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useI18n()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          {t("common.loading")}...
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-5 w-5" />
          {t("auth.loginButton")}
        </>
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const { t } = useI18n()
  const [state, formAction] = useActionState(signIn, null)

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">
          {t("auth.login")}
        </CardTitle>
        <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
          {t("auth.loginSubtitle")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
              {state.error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                {t("auth.email")}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                {t("auth.password")}
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>

          <SubmitButton />

          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              {t("auth.dontHaveAccount")}{" "}
              <Link
                href="/auth/register"
                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium hover:underline"
              >
                {t("auth.registerHere")}
              </Link>
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              <Link href="/" className="hover:text-green-600 dark:hover:text-green-400 hover:underline">
                ← {t("auth.backToHome")}
              </Link>
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
