import { SignUp, SignedIn, SignedOut } from "@clerk/nextjs";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignedInNotice } from "@/components/auth/SignedInNotice";

// Le type de compte (personnel ou organisation) n'est plus choisi ici mais juste après, sur
// /onboarding : un utilisateur qui s'inscrit via Google/GitHub/GitLab passe ainsi par la même
// étape qu'une inscription par email.
export default function SignupPage() {
  return (
    <AuthCard subtitle="Créez votre compte pour surveiller vos projets">
      <SignedIn>
        <SignedInNotice />
      </SignedIn>
      <SignedOut>
        <SignUp path="/signup" routing="path" signInUrl="/login" forceRedirectUrl="/onboarding" />
      </SignedOut>
    </AuthCard>
  );
}
