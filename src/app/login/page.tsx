import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="mx-auto max-w-sm space-y-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
        <p className="text-muted-foreground">
          Accès réservé aux personnes autorisées à modifier les données.
        </p>
      </div>
      <LoginForm next={next ?? "/saisie"} />
    </div>
  );
}
