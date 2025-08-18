"use client"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { submitEnrollment } from "@/lib/actions"

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
        t("enrollment.submit")
      )}
    </Button>
  )
}

export function EnrollmentForm() {
  const [state, formAction] = useActionState(submitEnrollment, null)
  const { t } = useI18n()

  if (state?.success) {
    return (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-green-800 dark:text-green-200 mb-2">
              {t("enrollment.success")}
            </h3>
            <p className="text-green-700 dark:text-green-300 mb-4">
              {t("enrollment.successMessage").replace("{name}", state.studentName)}
            </p>
            <p className="text-green-600 dark:text-green-400 text-sm">
              {t("enrollment.contactMessage").replace("{id}", state.enrollmentId)}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300">{state.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          {t("enrollment.studentData")}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentFirstName" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("enrollment.childName")} *
            </Label>
            <Input
              id="studentFirstName"
              name="studentFirstName"
              type="text"
              required
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: María"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentLastName" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("enrollment.childLastName")} *
            </Label>
            <Input
              id="studentLastName"
              name="studentLastName"
              type="text"
              required
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: González"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentBirthDate" className="text-gray-700 dark:text-gray-300 font-medium">
            {t("enrollment.birthDate")} *
          </Label>
          <Input
            id="studentBirthDate"
            name="studentBirthDate"
            type="date"
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          {t("enrollment.parentData")}
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parentFirstName" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("enrollment.parentName")} *
            </Label>
            <Input
              id="parentFirstName"
              name="parentFirstName"
              type="text"
              required
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: Ana"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentLastName" className="text-gray-700 dark:text-gray-300 font-medium">
              {t("enrollment.parentLastName")} *
            </Label>
            <Input
              id="parentLastName"
              name="parentLastName"
              type="text"
              required
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: González"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentEmail" className="text-gray-700 dark:text-gray-300 font-medium">
            {t("enrollment.email")} *
          </Label>
          <Input
            id="parentEmail"
            name="parentEmail"
            type="email"
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
            placeholder="ejemplo@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentPhone" className="text-gray-700 dark:text-gray-300 font-medium">
            {t("enrollment.phone")} *
          </Label>
          <Input
            id="parentPhone"
            name="parentPhone"
            type="tel"
            required
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
            placeholder="(011) 1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentAddress" className="text-gray-700 dark:text-gray-300 font-medium">
            {t("enrollment.address")}
          </Label>
          <Textarea
            id="parentAddress"
            name="parentAddress"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-green-500"
            placeholder="Calle, número, ciudad..."
            rows={3}
          />
        </div>
      </div>

      <SubmitButton />

      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{t("enrollment.termsMessage")}</p>
    </form>
  )
}
