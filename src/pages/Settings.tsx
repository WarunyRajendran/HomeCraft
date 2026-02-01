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
      toast.error("Passwords do not match");
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
      toast.success("Password updated successfully");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error updating";
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
      toast.success("Profile updated successfully");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error updating";
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    if (!user?.id) return;

    setIsDeleting(true);
    try {
      await authService.deleteAccount(user.id);
      toast.success("Account deleted successfully");
      navigate("/auth");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Error deleting account";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-gold flex items-center justify-center">
                  <Box className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
                </div>
                <span className="font-display text-lg sm:text-xl font-bold text-foreground">HomeCraft</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-safe max-w-2xl">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 sm:mb-8">Settings</h1>

        <div className="space-y-4 sm:space-y-6">
          {/* Profil */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Profile
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Edit your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
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
                    Email cannot be changed
                  </p>
                </div>

                <Button type="submit" disabled={isUpdatingProfile} className="gradient-gold text-accent-foreground hover:opacity-90">
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update profile"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Changement de mot de passe */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
                Change password
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your password to secure your account
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
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
                  <Label htmlFor="confirmPassword">Confirm password</Label>
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
                    Minimum 12 characters with uppercase, lowercase, number and special character
                  </p>
                </div>

                <Button type="submit" disabled={isUpdatingPassword || !newPassword || !confirmPassword} className="gradient-gold text-accent-foreground hover:opacity-90">
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Change password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Suppression de compte */}
          <Card className="border-destructive/50">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
                <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                Delete account
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                This action is irreversible. All your data will be deleted.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-4">
                <div className="p-3 sm:p-4 bg-destructive/10 rounded-lg text-xs sm:text-sm text-destructive">
                  <p className="font-medium mb-2">Warning:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>All your projects will be deleted</li>
                    <li>Your profile will be erased</li>
                    <li>This action cannot be undone</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirmation">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="deleteConfirmation"
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>

                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || deleteConfirmation !== "DELETE"}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete my account
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
