"use client"

import { EnrollmentForm } from "@/components/enrollment-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useI18n } from "@/lib/i18n/context"
import { Heart, Users, BookOpen, Shield, LogIn } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { t } = useI18n()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-green-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-green-700 dark:text-green-400 mb-2">
                {t("header.title")}
              </h1>
              <p className="text-green-600 dark:text-green-300 text-lg">{t("header.subtitle")}</p>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
              <Link href="/auth/login">
                <Button
                  variant="outline"
                  className="border-green-600 text-green-700 hover:bg-green-50 bg-transparent dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900/20"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  {t("header.systemAccess")}
                </Button>
              </Link>
            </div>
          </div>
          {/* Mobile buttons */}
          <div className="md:hidden mt-4 flex items-center justify-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
            <Link href="/auth/login">
              <Button
                variant="outline"
                size="sm"
                className="border-green-600 text-green-700 hover:bg-green-50 bg-transparent dark:border-green-400 dark:text-green-300 dark:hover:bg-green-900/20"
              >
                <LogIn className="h-4 w-4 mr-2" />
                {t("header.systemAccess")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 dark:text-gray-100 mb-6">
              {t("hero.title")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">{t("hero.description")}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              <div className="flex flex-col items-center">
                <div className="bg-green-100 p-4 rounded-full mb-3">
                  <Heart className="h-8 w-8 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.personalizedCare")}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 p-4 rounded-full mb-3">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t("hero.smallGroups")}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-100 p-4 rounded-full mb-3">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.integralEducation")}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-orange-100 p-4 rounded-full mb-3">
                  <Shield className="h-8 w-8 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("hero.safeEnvironment")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Enrollment Form Section */}
        <section className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl font-serif font-bold text-gray-800 dark:text-gray-100">
                {t("enrollment.title")}
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                {t("enrollment.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentForm />
            </CardContent>
          </Card>
        </section>

        {/* Information Section */}
        <section className="mt-16 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-green-200 dark:border-green-700">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-green-700 dark:text-green-400">
                {t("process.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-gray-700 dark:text-gray-300">{t("process.step1")}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-gray-700 dark:text-gray-300">{t("process.step2")}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-gray-700 dark:text-gray-300">{t("process.step3")}</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  4
                </div>
                <p className="text-gray-700 dark:text-gray-300">{t("process.step4")}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-blue-200 dark:border-blue-700">
            <CardHeader>
              <CardTitle className="text-xl font-serif text-blue-700 dark:text-blue-400">{t("info.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
              <p>{t("info.ages")}</p>
              <p>{t("info.schedule")}</p>
              <p>{t("info.lottery")}</p>
              <p>{t("info.startDate")}</p>
              <p>{t("info.vacancies")}</p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-green-800 dark:bg-gray-900 text-white mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="text-xl font-serif font-bold mb-4">{t("header.title")}</h3>
            <p className="text-green-200 dark:text-gray-300 mb-2">{t("footer.address")}</p>
            <p className="text-green-200 dark:text-gray-300 mb-2">{t("footer.phone")}</p>
            <p className="text-green-200 dark:text-gray-300">{t("footer.email")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
