"use client";

import { RegisterForm } from "@/components/forms/RegisterForm";
import { RandomBackgroundLayout } from "@/components/forms/RandomBackgroundLayout";

// Verhindert statisches Rendering
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <RandomBackgroundLayout imageFolder="/lrg/login-register-bg" imageCount={10}>
      <main className="flex flex-col items-center justify-center min-h-screen py-20">
        <RegisterForm />
      </main>
    </RandomBackgroundLayout>
  );
}
