import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Box, Mail, Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useSignIn, useSignUp, useResetPassword } from "@/hooks/useAuth";
import { PasswordSchema } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") === "signup" ? "signup" : "login");

  // Auth hooks
  const { user } = useAuth();
  const signInMutation = useSignIn();
  const signUpMutation = useSignUp();
  const resetPasswordMutation = useResetPassword();

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  // Track if we're in password recovery mode (to prevent redirect to dashboard)
  const isRecoveryMode = useRef(false);

  // Listen for PASSWORD_RECOVERY event to prevent redirect
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        isRecoveryMode.current = true;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if already logged in (but not during password recovery)
  useEffect(() => {
    // Don't redirect if this is a password recovery session
    const hash = window.location.hash;
    const isRecoveryFlow = hash.includes("type=recovery") || isRecoveryMode.current;

    if (user && !isRecoveryFlow) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInMutation.mutateAsync({
        email: loginEmail,
        password: loginPassword,
      });

      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur s'est produite";
      if (message.includes("Invalid login credentials")) {
        toast.error("Email ou mot de passe incorrect");
      } else {
        toast.error(message);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await resetPasswordMutation.mutateAsync(forgotPasswordEmail);
      toast.success("Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.");
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
      // Clear login fields to avoid confusion
      setLoginEmail("");
      setLoginPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur s'est produite";
      toast.error(message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider le mot de passe avec Zod
    const passwordValidation = PasswordSchema.safeParse(signupPassword);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.issues[0].message);
      return;
    }

    try {
      await signUpMutation.mutateAsync({
        email: signupEmail,
        password: signupPassword,
        fullName: signupName,
      });

      toast.success("Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.");
      setActiveTab("login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Une erreur s'est produite";
      if (message.includes("already registered")) {
        toast.error("Cet email est déjà utilisé");
      } else {
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        {/* Back link - commenté car pas de page d'accueil publique pour le moment
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        */}

        <Card className="shadow-elegant border-border/50">
          <CardHeader className="text-center pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-gold flex items-center justify-center mb-3 sm:mb-4">
              <Box className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <CardTitle className="font-display text-xl sm:text-2xl">HomeCraft</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Connectez-vous pour accéder à vos projets
            </CardDescription>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="login" className="text-xs sm:text-sm">Connexion</TabsTrigger>
                <TabsTrigger value="signup" className="text-xs sm:text-sm">Inscription</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                {showForgotPassword ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="font-semibold text-base sm:text-lg">Mot de passe oublié ?</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        Entrez votre email pour recevoir un lien de réinitialisation
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="vous@exemple.com"
                          className="pl-10"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full gradient-gold text-accent-foreground hover:opacity-90"
                      disabled={resetPasswordMutation.isPending}
                    >
                      {resetPasswordMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        "Envoyer le lien"
                      )}
                    </Button>

                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Retour à la connexion
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="vous@exemple.com"
                          className="pl-10"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Mot de passe</Label>
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs text-muted-foreground hover:text-accent transition-colors"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••"
                          className="pl-10 pr-10 tracking-tighter sm:tracking-normal"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showLoginPassword ? (
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
                      disabled={signInMutation.isPending}
                    >
                      {signInMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Connexion...
                        </>
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Jean Dupont"
                        className="pl-10"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="vous@exemple.com"
                        className="pl-10"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showSignupPassword ? "text" : "password"}
                        placeholder="••••••"
                        className="pl-10 pr-10 tracking-tighter sm:tracking-normal"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        required
                        minLength={12}
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showSignupPassword ? (
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

                  <Button
                    type="submit"
                    className="w-full gradient-gold text-accent-foreground hover:opacity-90"
                    disabled={signUpMutation.isPending}
                  >
                    {signUpMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Création...
                      </>
                    ) : (
                      "Créer un compte"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;