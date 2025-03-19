"use client";

import { LoginForm } from "@/components/forms/LoginForm";
import { RandomBackgroundLayout } from "@/components/forms/RandomBackgroundLayout";

// Verhindert statisches Rendering
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return (
    <RandomBackgroundLayout imageFolder="/lrg/login-register-bg" imageCount={10}>
      <main className="flex flex-col items-center justify-center min-h-screen py-20">
        <LoginForm />
      </main>
    </RandomBackgroundLayout>
  );
}
