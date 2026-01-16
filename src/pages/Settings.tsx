import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Box, ArrowLeft, Lock, Trash2, Eye, EyeOff, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { authService } from "@/services/auth.service";
import { PasswordSchema } from "@/lib/validation";

const Settings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  // Changement de mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Modification du profil
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Suppression de compte
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    const passwordValidation = PasswordSchema.safeParse(newPassword);
    if (!passwordValidation.success) {
      toast.error(passwordValidation.error.issues[0].message);
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authService.updatePassword(newPassword);
      toast.success("Mot de passe mis à jour avec succès");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) return;

    setIsUpdatingProfile(true);
    try {
      await authService.updateProfile(user.id, { full_name: fullName });
      toast.success("Profil mis à jour avec succès");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "SUPPRIMER") {
      toast.error("Veuillez taper SUPPRIMER pour confirmer");
      return;
    }

    if (!user?.id) return;

    setIsDeleting(true);
    try {
      await authService.deleteAccount(user.id);
      toast.success("Compte supprimé avec succès");
      navigate("/auth");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
                  <Box className="w-5 h-5 text-accent-foreground" />
                </div>
                <span className="font-display text-xl font-bold text-foreground">HomeCraft</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold text-foreground mb-8">Paramètres</h1>

        <div className="space-y-6">
          {/* Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profil
              </CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nom complet</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom complet"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <Button type="submit" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour le profil"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Changement de mot de passe */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Changer le mot de passe
              </CardTitle>
              <CardDescription>
                Mettez à jour votre mot de passe pour sécuriser votre compte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pr-10"
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
                  <p className="text-xs text-muted-foreground">
                    Minimum 12 caractères avec majuscule, minuscule, chiffre et caractère spécial
                  </p>
                </div>

                <Button type="submit" disabled={isUpdatingPassword || !newPassword || !confirmPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Changer le mot de passe"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Suppression de compte */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Trash2 className="h-5 w-5" />
                Supprimer le compte
              </CardTitle>
              <CardDescription>
                Cette action est irréversible. Toutes vos données seront supprimées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-lg text-sm text-destructive">
                  <p className="font-medium mb-2">Attention :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Tous vos projets seront supprimés</li>
                    <li>Votre profil sera effacé</li>
                    <li>Cette action ne peut pas être annulée</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation">
                    Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="SUPPRIMER"
                  />
                </div>

                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== "SUPPRIMER"}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Suppression...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer mon compte
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
