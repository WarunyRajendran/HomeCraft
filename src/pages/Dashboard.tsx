import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Box, LogOut, Plus, Camera, Pencil, Trash2, Settings, UserCog, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth, useProfile } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useUserProjects, useDeleteProject } from "@/hooks/useProjects";
import { authService } from "@/services/auth.service";
import { sanitizeImageUrl } from "@/lib/validation";
import { NewProjectModal } from "@/components/dashboard/NewProjectModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { isAdmin } = useAdmin();
  const { data: projects, isLoading } = useUserProjects();
  const deleteProject = useDeleteProject();
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.signOut();
      toast.success("Déconnexion réussie");
      navigate("/auth");
    } catch {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  const handleDelete = async (projectId: string, projectName: string) => {
    if (confirm(`Supprimer le projet "${projectName}" ?`)) {
      try {
        await deleteProject.mutateAsync(projectId);
        toast.success("Projet supprimé");
      } catch {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl gradient-gold flex items-center justify-center">
                <Box className="w-4 h-4 sm:w-5 sm:h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold text-foreground">HomeCraft</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 lg:gap-4">
              <span className="text-sm text-muted-foreground hidden lg:block">
                {profile?.full_name || user?.email}
              </span>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Settings className="w-4 h-4 lg:mr-2" />
                  <span className="hidden lg:inline">Administration</span>
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
                <UserCog className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Paramètres</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 lg:mr-2" />
                <span className="hidden lg:inline">Déconnexion</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-border space-y-2">
              <p className="text-sm text-muted-foreground px-1 mb-3">
                {profile?.full_name || user?.email}
              </p>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    navigate("/admin");
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Administration
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  navigate("/settings");
                  setIsMobileMenuOpen(false);
                }}
              >
                <UserCog className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 pb-safe">
        <div className="mb-6 sm:mb-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Mes Projets
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Créez un nouveau projet ou continuez à travailler sur vos designs.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-36 sm:h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-3 sm:p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* New Project Card */}
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-52 sm:h-64 p-4 sm:p-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-accent/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
                  <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">Nouveau Projet</h3>
                <p className="text-xs sm:text-sm text-muted-foreground text-center">
                  Créez un nouveau projet d'aménagement
                </p>
              </CardContent>
            </Card>

            {/* Project Cards */}
            {projects.map(project => {
              const sanitizedImageUrl = sanitizeImageUrl(project.room_image_url);
              return (
                <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                  <div
                    className="h-36 sm:h-48 bg-gradient-to-br from-blue-50 to-indigo-100 bg-cover bg-center flex items-center justify-center rounded-t-lg"
                    style={{
                      backgroundImage: sanitizedImageUrl
                        ? `url(${sanitizedImageUrl})`
                        : 'none'
                    }}
                  >
                    {!sanitizedImageUrl && (
                      <Camera className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30" />
                    )}
                  </div>
                <CardContent className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base text-foreground mb-1 truncate">{project.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                      onClick={() => navigate(`/editor/${project.id}`)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 sm:h-9 w-8 sm:w-9 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(project.id, project.name);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-6 sm:p-12 text-center">
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Camera className="w-7 h-7 sm:w-10 sm:h-10 text-accent" />
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-card-foreground mb-2 sm:mb-3">
              Aucun projet pour le moment
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
              Commencez par prendre une photo de votre pièce pour créer votre premier projet de design d'intérieur.
            </p>
            <Button
              className="gradient-gold text-accent-foreground hover:opacity-90 shadow-gold px-6 sm:px-8"
              onClick={() => navigate("/editor")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un projet
            </Button>
          </div>
        )}
      </main>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;