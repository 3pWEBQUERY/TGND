"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRole } from "@prisma/client";
import { uploadImage } from "@/lib/firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Image from "next/image";

// Validierungsschema für das Registrierungsformular
const registerSchema = z.object({
  // Schritt 1: Kontotyp
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: "Bitte wähle einen Kontotyp" }),
  }),
  
  // Schritt 2: Account-Informationen
  email: z
    .string()
    .email("Bitte gib eine gültige E-Mail Adresse ein")
    .min(1, "E-Mail ist erforderlich"),
  name: z
    .string()
    .min(3, "Benutzername muss mindestens 3 Zeichen lang sein")
    .max(50, "Benutzername darf maximal 50 Zeichen lang sein"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein")
    .max(100, "Passwort darf maximal 100 Zeichen lang sein")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/,
      "Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten"
    ),
  confirmPassword: z.string(),
  
  // Schritt 3: Profilinformationen
  displayName: z.string().min(3, "Anzeigename muss mindestens 3 Zeichen lang sein").optional(),
  // phoneNumber wurde entfernt und durch profileImage ersetzt (wird nicht validiert da File-Upload)
  location: z.string().optional(),
  gender: z.string().optional(),
  age: z.coerce.number().min(18, "Du musst mindestens 18 Jahre alt sein").optional(),
  bio: z.string().max(500, "Biografie darf maximal 500 Zeichen lang sein").optional(),
  
  // Schritt 4: Zustimmung zu den Bedingungen
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Du musst den AGB und Datenschutzbestimmungen zustimmen",
  }),
  ageVerification: z.boolean().refine(val => val === true, {
    message: "Du musst bestätigen, dass du mindestens 18 Jahre alt bist",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwörter stimmen nicht überein",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: undefined,
      email: "",
      name: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
      ageVerification: false,
    },
    mode: 'onChange',
  });
  
  // Debug-Ausgabe bei Fehlern
  console.log('Form errors:', errors);
  console.log('Is form valid:', isValid);

  const role = watch("role");

  // Wir verwenden jetzt direkte setStep-Aufrufe in den Buttons statt dieser Helfer-Funktionen
  // Diese behalten wir für die Kompatibilität
  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  // Funktion zum Verarbeiten des Bildwechsels
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      setSelectedImage(null);
      setSelectedImageUrl(null);
      return;
    }

    const file = e.target.files[0];
    
    // Überprüfe Dateityp
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wähle ein gültiges Bildformat');
      return;
    }
    
    // Überprüfe Dateigröße (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Das Bild darf maximal 5MB groß sein');
      return;
    }

    setSelectedImage(file);
    setSelectedImageUrl(URL.createObjectURL(file));
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      let profileImageUrl = null;
      
      // Bild hochladen, wenn eines ausgewählt wurde
      if (selectedImage) {
        try {
          const { url } = await uploadImage(selectedImage);
          profileImageUrl = url;
          setUploadedImageUrl(url);
        } catch (error) {
          console.error('Fehler beim Hochladen des Profilbilds:', error);
          toast.error('Fehler beim Hochladen des Profilbilds');
          return;
        }
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          profileImage: profileImageUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registrierung fehlgeschlagen');
      }

      toast.success('Registrierung erfolgreich!');
      router.push('/auth/login');
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      setError(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
      toast.error(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  // Fortschrittsleiste
  const progress = (step / 4) * 100;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-2">
        {step === 1 && "Kontotyp wählen"}
        {step === 2 && "Account erstellen"}
        {step === 3 && "Dein Profil"}
        {step === 4 && "Fast geschafft!"}
      </h1>

      {/* Fortschrittsanzeige */}
      <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full mb-6">
        <div
          className="bg-[hsl(var(--primary))] h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Schritt 1: Kontotyp */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <label
                className={`block p-4 border rounded-lg transition-all cursor-pointer ${
                  role === "MEMBER"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]"
                    : "border-gray-300 dark:border-gray-700 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5]"
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    value="MEMBER"
                    {...register("role")}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-900 dark:text-white">
                      Mitglied
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Für Nutzer, die Dienstleistungen suchen
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 border rounded-lg transition-all cursor-pointer ${
                  role === "ESCORT"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]"
                    : "border-gray-300 dark:border-gray-700 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5]"
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    value="ESCORT"
                    {...register("role")}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-900 dark:text-white">
                      Escort
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Für unabhängige Begleitpersonen
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 border rounded-lg transition-all cursor-pointer ${
                  role === "AGENCY"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]"
                    : "border-gray-300 dark:border-gray-700 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5]"
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    value="AGENCY"
                    {...register("role")}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-900 dark:text-white">
                      Agentur
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Für Escort-Agenturen
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 border rounded-lg transition-all cursor-pointer ${
                  role === "CLUB"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]"
                    : "border-gray-300 dark:border-gray-700 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5]"
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    value="CLUB"
                    {...register("role")}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-900 dark:text-white">
                      Club
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Für Clubs und Etablissements
                    </span>
                  </div>
                </div>
              </label>

              <label
                className={`block p-4 border rounded-lg transition-all cursor-pointer ${
                  role === "STUDIO"
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))/5]"
                    : "border-gray-300 dark:border-gray-700 hover:border-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/5]"
                }`}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    value="STUDIO"
                    {...register("role")}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <span className="block font-medium text-gray-900 dark:text-white">
                      Studio
                    </span>
                    <span className="block text-sm text-gray-500 dark:text-gray-400">
                      Für Studios und Produktionsunternehmen
                    </span>
                  </div>
                </div>
              </label>
            </div>
            {errors.role && (
              <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>
            )}
          </div>
        )}
        {/* Schritt 2: Account-Informationen */}
        {step === 2 && (
          <div className="space-y-4">
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

            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Benutzername
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                placeholder="Dein Benutzername"
                {...register("name")}
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="mb-4">
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

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Passwort bestätigen
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="input-field"
                {...register("confirmPassword")}
                disabled={isLoading}
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Schritt 3: Profilinformationen */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="mb-4">
              <Label htmlFor="profileImage">Profilbild</Label>
              <div className="flex flex-col items-center gap-4">
                {selectedImageUrl && (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden">
                    <Image
                      src={selectedImageUrl}
                      alt="Vorschau"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Anzeigename
              </label>
              <input
                id="displayName"
                type="text"
                className="input-field"
                placeholder="Wie möchtest du genannt werden?"
                {...register("displayName")}
                disabled={isLoading}
              />
              {errors.displayName && (
                <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Standort (optional)
              </label>
              <input
                id="location"
                type="text"
                className="input-field"
                placeholder="Stadt, Land"
                {...register("location")}
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4 relative">
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Geschlecht (optional)
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    className="input-field pr-10 appearance-none bg-white dark:bg-zinc-800 w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-[hsl(var(--primary))] focus:border-[hsl(var(--primary))]"
                    {...register("gender")}
                    disabled={isLoading}
                    defaultValue=""
                  >
                    <option value="" disabled>Bitte auswählen...</option>
                    <option value="male">Männlich</option>
                    <option value="female">Weiblich</option>
                    <option value="diverse">Divers</option>
                    <option value="other">Andere</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                {errors.gender && (
                  <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Alter
                </label>
                <input
                  id="age"
                  type="number"
                  className="input-field"
                  min={18}
                  max={99}
                  {...register("age")}
                  disabled={isLoading}
                />
                {errors.age && (
                  <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Über dich (optional)
              </label>
              <textarea
                id="bio"
                className="input-field min-h-[100px]"
                placeholder="Erzähle etwas über dich..."
                {...register("bio")}
                disabled={isLoading}
              ></textarea>
              {errors.bio && (
                <p className="text-red-500 text-xs mt-1">{errors.bio.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Schritt 4: Zustimmung zu den Bedingungen */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Zusammenfassung
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p><span className="font-medium">Kontotyp:</span> {role}</p>
                <p><span className="font-medium">E-Mail:</span> {watch("email")}</p>
                <p><span className="font-medium">Benutzername:</span> {watch("name")}</p>
                {watch("displayName") && (
                  <p><span className="font-medium">Anzeigename:</span> {watch("displayName")}</p>
                )}
                {watch("location") && (
                  <p><span className="font-medium">Standort:</span> {watch("location")}</p>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register("ageVerification")}
                  disabled={isLoading}
                />
                <span className="ml-3 block text-sm text-gray-600 dark:text-gray-400">
                  Ich bestätige, dass ich mindestens 18 Jahre alt bin
                </span>
              </label>
              {errors.ageVerification && (
                <p className="text-red-500 text-xs mt-1">{errors.ageVerification.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  className="mt-1"
                  {...register("termsAccepted")}
                  disabled={isLoading}
                />
                <span className="ml-3 block text-sm text-gray-600 dark:text-gray-400">
                  Ich stimme den{" "}
                  <Link href="/agb" className="text-[hsl(var(--primary))] hover:underline">
                    AGB
                  </Link>{" "}
                  und{" "}
                  <Link href="/datenschutz" className="text-[hsl(var(--primary))] hover:underline">
                    Datenschutzbestimmungen
                  </Link>{" "}
                  zu
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1">{errors.termsAccepted.message}</p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="btn-outline"
              disabled={isLoading}
            >
              Zurück
            </button>
          )}
          {step === 1 && <div />}

          {/* Manuelle Step-Buttons für bessere Kontrolle statt Submit */}
          {step === 1 && (
            <button
              type="button"
              onClick={() => {
                console.log('Step 1: Manual next step clicked');
                if (role) {
                  setStep(2);
                } else {
                  console.log('No role selected');
                  alert('Bitte wähle einen Kontotyp aus');
                }
              }}
              className="btn-primary"
              disabled={isLoading}
            >
              Weiter
            </button>
          )}
          
          {step === 2 && (
            <button
              type="button"
              onClick={() => {
                console.log('Step 2: Manual next step clicked');
                const email = watch('email');
                const name = watch('name');
                const password = watch('password');
                const confirmPassword = watch('confirmPassword');
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                // Erweiterte Validierung mit besseren Fehlermeldungen
                if (!email || !emailRegex.test(email)) {
                  alert('Bitte gib eine gültige E-Mail-Adresse ein');
                  return;
                }
                if (!name || name.length < 3) {
                  alert('Bitte gib einen Benutzernamen mit mindestens 3 Zeichen ein');
                  return;
                }
                if (!password || password.length < 8) {
                  alert('Das Passwort muss mindestens 8 Zeichen haben');
                  return;
                }
                if (password !== confirmPassword) {
                  alert('Die Passwörter stimmen nicht überein');
                  return;
                }
                
                // Passwort-Komplexität überprüfen (großer Buchstabe, Zahl, Sonderzeichen)
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
                if (!passwordRegex.test(password)) {
                  alert('Das Passwort muss mindestens einen Großbuchstaben, einen Kleinbuchstaben, eine Zahl und ein Sonderzeichen enthalten');
                  return;
                }
                
                // Alles in Ordnung, zum nächsten Schritt
                setStep(3);
              }}
              className="btn-primary"
              disabled={isLoading}
            >
              Weiter
            </button>
          )}
          
          {step === 3 && (
            <button
              type="button"
              onClick={() => {
                console.log('Step 3: Manual next step clicked');
                // Hier könnten wir weitere Validierungen hinzufügen, aber diese Felder sind optional
                setStep(4);
              }}
              className="btn-primary"
              disabled={isLoading}
            >
              Weiter
            </button>
          )}
          
          {step === 4 && (
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Wird verarbeitet..." : "Registrieren"}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Du hast bereits ein Konto?{" "}
          <Link
            href="/auth/login"
            className="text-[hsl(var(--primary))] hover:underline"
          >
            Anmelden
          </Link>
        </p>
      </div>
    </div>
  );
}
