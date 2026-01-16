import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Box, LogOut, Plus, Camera, Pencil, Trash2, Settings, UserCog } from "lucide-react";
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
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl gradient-gold flex items-center justify-center">
                <Box className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">HomeCraft</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {profile?.full_name || user?.email}
              </span>
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Administration
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
                <UserCog className="w-4 h-4 mr-2" />
                Paramètres
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Mes Projets
          </h1>
          <p className="text-muted-foreground">
            Créez un nouveau projet ou continuez à travailler sur vos designs.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-t-lg"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-3"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* New Project Card */}
            <Card
              className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg group"
              onClick={() => setIsNewProjectModalOpen(true)}
            >
              <CardContent className="flex flex-col items-center justify-center h-64 p-6">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Plus className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Nouveau Projet</h3>
                <p className="text-sm text-muted-foreground text-center">
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
                    className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 bg-cover bg-center flex items-center justify-center rounded-t-lg"
                    style={{
                      backgroundImage: sanitizedImageUrl
                        ? `url(${sanitizedImageUrl})`
                        : 'none'
                    }}
                  >
                    {!sanitizedImageUrl && (
                      <Camera className="h-16 w-16 text-muted-foreground/30" />
                    )}
                  </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{project.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Créé le {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/editor/${project.id}`)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Éditer
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
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
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-card-foreground mb-3">
              Aucun projet pour le moment
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Commencez par prendre une photo de votre pièce pour créer votre premier projet de design d'intérieur.
            </p>
            <Button
              className="gradient-gold text-accent-foreground hover:opacity-90 shadow-gold px-8"
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