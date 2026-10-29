import { SignIn } from "@clerk/nextjs";
import { AuthCard } from "@/components/auth/AuthCard";

// Route "catch-all" : Clerk gère lui-même les étapes suivantes de la connexion (code de
// vérification, retour OAuth Google/GitHub/GitLab, mot de passe oublié) sous /login/...
export default function LoginPage() {
  return (
    <AuthCard subtitle="Connectez-vous pour surveiller vos projets">
      <SignIn path="/login" routing="path" signUpUrl="/signup" />
    </AuthCard>
  );
}
