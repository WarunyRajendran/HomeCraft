import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Box, Mail, Lock, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuth, useUpdatePassword } from "@/hooks/useAuth";
import { PasswordSchema } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updatePasswordMutation = useUpdatePassword();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has a valid session (set by AuthListener after PASSWORD_RECOVERY event)
    const checkSession = async () => {
      // Small delay to ensure session is set
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setIsValidSession(true);
      } else {
        toast.error("Lien de réinitialisation invalide ou expiré");
        navigate("/auth");
      }
      setIsLoading(false);
    };

    checkSession();
  }, [navigate]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verify email matches the session user
    if (user && email.toLowerCase() !== user.email?.toLowerCase()) {
      toast.error("L'email ne correspond pas au compte");
      return;
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    // Validate password strength
    const passwordValidation = PasswordSchema.safeParse(newPassword);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.issues[0].message);
      return;
    }

    try {
      await updatePasswordMutation.mutateAsync(newPassword);
      toast.success("Mot de passe modifié avec succès !");

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/auth");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur s'est produite";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-foreground" />
          <p className="mt-4 text-muted-foreground">Vérification du lien...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>

        <Card className="shadow-elegant border-border/50">
          <CardHeader className="text-center pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-gold flex items-center justify-center mb-3 sm:mb-4">
              <Box className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <CardTitle className="font-display text-xl sm:text-2xl">Nouveau mot de passe</CardTitle>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Confirmez votre email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="vous@exemple.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="pl-10 pr-10 tracking-tighter sm:tracking-normal"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum 12 caractères avec majuscule, minuscule, chiffre et caractère spécial
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••"
                    className="pl-10 pr-10 tracking-tighter sm:tracking-normal"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={12}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-gold text-accent-foreground hover:opacity-90"
                disabled={updatePasswordMutation.isPending}
              >
                {updatePasswordMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Modification...
                  </>
                ) : (
                  "Modifier le mot de passe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
