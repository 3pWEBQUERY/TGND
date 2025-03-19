"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Validierungsschema für das Login-Formular
const loginSchema = z.object({
  email: z
    .string()
    .email("Bitte gib eine gültige E-Mail Adresse ein")
    .min(1, "E-Mail ist erforderlich"),
  password: z
    .string()
    .min(1, "Passwort ist erforderlich"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstStep, setIsFirstStep] = useState(true);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = watch("email");

  // Erster Schritt - E-Mail Überprüfung
  const handleEmailSubmit = (data: LoginFormValues) => {
    // Hier wird das Formular nicht abgesendet, sondern nur der State geändert
    if (data.email && !errors.email) {
      setIsFirstStep(false);
    }
  };

  // Zweiter Schritt - Vollstændiger Login
  // Vollständiger Login-Prozess
  const onSubmit = async (data: LoginFormValues) => {
    // Wenn wir noch im ersten Schritt sind, nur zur nächsten Stufe gehen
    if (isFirstStep) {
      handleEmailSubmit(data);
      return;
    }
    
    // Andernfalls den vollständigen Login-Prozess ausführen
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Ungültige Anmeldedaten. Bitte versuche es erneut.");
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Anmelden</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {isFirstStep ? (
          // Erster Schritt - E-Mail eingeben
          <>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                E-Mail Adresse
              </label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="deine@email.ch"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <button
              type="button"
              className="btn-primary w-full"
              disabled={isLoading || !email || !!errors.email}
              onClick={() => {
                if (email && !errors.email) {
                  setIsFirstStep(false);
                }
              }}
            >
              {isLoading ? "Wird geladen..." : "Weiter"}
            </button>
          </>
        ) : (
          // Zweiter Schritt - Passwort eingeben
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  E-Mail Adresse
                </label>
                <button
                  type="button"
                  className="text-xs text-[hsl(var(--primary))]"
                  onClick={() => setIsFirstStep(true)}
                >
                  Ändern
                </button>
              </div>
              <div className="p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 mb-4">
                {email}
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Passwort
              </label>
              <input
                id="password"
                type="password"
                className="input-field"
                {...register("password")}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end mb-4">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-[hsl(var(--primary))] hover:underline"
              >
                Passwort vergessen?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? "Wird angemeldet..." : "Anmelden"}
            </button>
          </>
        )}
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Du hast noch kein Konto?{" "}
          <Link
            href="/auth/register"
            className="text-[hsl(var(--primary))] hover:underline"
          >
            Jetzt registrieren
          </Link>
        </p>
      </div>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-zinc-900 text-gray-500 dark:text-gray-400">
              Oder anmelden mit
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
            onClick={() => signIn("facebook", { callbackUrl: "/dashboard" })}
          >
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700"
            onClick={() => signIn("apple", { callbackUrl: "/dashboard" })}
          >
            <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12.151 0c-1.204.027-2.713.825-3.6 1.825-.794.9-1.444 2.22-1.192 3.49 1.288.097 2.585-.44 3.34-1.43.788-.963 1.295-2.294 1.132-3.609-.91-.01-.177-.019-.271.0073-.255.072-.409.132-.409.132zm3.639 3.961c-1.818-.109-3.368 1.038-4.229 1.038-.877 0-2.218-1.001-3.636-.969-1.87.032-3.594 1.092-4.552 2.773-1.946 3.364-.505 8.354 1.397 11.08.925 1.34 2.033 2.842 3.492 2.786 1.386-.055 1.923-.896 3.598-.896 1.682 0 2.166.896 3.627.874 1.512-.032 2.464-1.365 3.39-2.705.943-1.365 1.328-2.69 1.355-2.76-.033-.011-2.607-1.015-2.631-3.991-.022-2.498 2.034-3.678 2.126-3.744-1.169-1.713-2.967-1.905-3.619-1.94-.253-.033-.56-.054-.917-.033z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
