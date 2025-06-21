"use client"

import { RegisterForm } from "@/components/auth/register-form"
import { Users, Shield, Globe, Building2 } from "lucide-react"
import Header from "@/components/layout/header"
import FooterOne from "@/components/footer/footer-one"

export default function RegisterPage() {
  return (
    <>
      <Header />
      <div className="flex min-h-screen flex-col items-center bg-gray-50 p-4">
      <br/>
      <br/>
      <br/>
        <RegisterForm />
      <br/>
      <br/>
      <br/>
      </div>
      <FooterOne />
    </>
  )
}
