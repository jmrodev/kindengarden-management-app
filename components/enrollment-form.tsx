"use client"
import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { submitEnrollment } from "@/lib/actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Enviando inscripción...
        </>
      ) : (
        "Enviar Inscripción"
      )}
    </Button>
  )
}

export function EnrollmentForm() {
  const [state, formAction] = useActionState(submitEnrollment, null)

  if (state?.success) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-green-800 mb-2">¡Inscripción Exitosa!</h3>
            <p className="text-green-700 mb-4">
              Hemos recibido la inscripción de <strong>{state.studentName}</strong>.
            </p>
            <p className="text-green-600 text-sm">
              Te contactaremos por email si tu hijo resulta seleccionado en el sorteo. Tu número de inscripción es:{" "}
              <strong>#{state.enrollmentId}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{state.error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Datos del Alumno */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Datos del Alumno
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="studentFirstName" className="text-gray-700 font-medium">
              Nombre del niño/a *
            </Label>
            <Input
              id="studentFirstName"
              name="studentFirstName"
              type="text"
              required
              className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: María"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentLastName" className="text-gray-700 font-medium">
              Apellido del niño/a *
            </Label>
            <Input
              id="studentLastName"
              name="studentLastName"
              type="text"
              required
              className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: González"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studentBirthDate" className="text-gray-700 font-medium">
            Fecha de nacimiento *
          </Label>
          <Input
            id="studentBirthDate"
            name="studentBirthDate"
            type="date"
            required
            className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Datos del Padre/Madre/Tutor */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Datos del Padre/Madre/Tutor
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parentFirstName" className="text-gray-700 font-medium">
              Nombre *
            </Label>
            <Input
              id="parentFirstName"
              name="parentFirstName"
              type="text"
              required
              className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: Ana"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentLastName" className="text-gray-700 font-medium">
              Apellido *
            </Label>
            <Input
              id="parentLastName"
              name="parentLastName"
              type="text"
              required
              className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
              placeholder="Ej: González"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentEmail" className="text-gray-700 font-medium">
            Email *
          </Label>
          <Input
            id="parentEmail"
            name="parentEmail"
            type="email"
            required
            className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
            placeholder="ejemplo@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentPhone" className="text-gray-700 font-medium">
            Teléfono *
          </Label>
          <Input
            id="parentPhone"
            name="parentPhone"
            type="tel"
            required
            className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
            placeholder="(011) 1234-5678"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parentAddress" className="text-gray-700 font-medium">
            Dirección
          </Label>
          <Textarea
            id="parentAddress"
            name="parentAddress"
            className="bg-white border-gray-300 focus:border-green-500 focus:ring-green-500"
            placeholder="Calle, número, ciudad..."
            rows={3}
          />
        </div>
      </div>

      <SubmitButton />

      <p className="text-sm text-gray-600 text-center">
        Al enviar este formulario, aceptas participar en el sorteo de vacantes. Los campos marcados con * son
        obligatorios.
      </p>
    </form>
  )
}
