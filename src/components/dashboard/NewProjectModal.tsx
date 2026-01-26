import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader } from "../ui/card";
import { X, Image, Camera } from "lucide-react";
import { toast } from "sonner";
import { useCreateProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewProjectModal = ({ isOpen, onClose }: NewProjectModalProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createProject = useCreateProject();

  const [projectName, setProjectName] = useState("");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [roomWidth, setRoomWidth] = useState<number>(4);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (file && allowedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBackgroundImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else if (file) {
      toast.error("Format non supporté. Utilisez PNG ou JPEG.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleCreate = async () => {
    if (!projectName.trim()) {
      toast.error("Veuillez entrer un nom de projet");
      return;
    }
    if (!backgroundImage) {
      toast.error("Veuillez ajouter une photo de votre pièce");
      return;
    }
    if (!user) {
      toast.error("Vous devez être connecté");
      return;
    }

    setIsCreating(true);
    try {
      const projectData = {
        user_id: user.id,
        name: projectName.trim(),
        room_data: { backgroundImage, roomWidth },
        furniture_placements: [],
        room_image_url: backgroundImage,
      };

      const newProject = await createProject.mutateAsync(projectData);
      toast.success("Projet créé avec succès");
      onClose();
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      toast.error("Erreur lors de la création du projet");
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setProjectName("");
    setBackgroundImage(null);
    setRoomWidth(4);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6 sticky top-0 bg-card z-10">
          <h2 className="text-lg sm:text-xl font-semibold">Nouveau Projet</h2>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 sm:h-9 sm:w-9">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Nom du projet */}
          <div className="space-y-2">
            <Label htmlFor="projectName">Nom du projet</Label>
            <Input
              id="projectName"
              placeholder="Ex: Salon moderne, Chambre cosy..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Upload d'image */}
          <div className="space-y-2">
            <Label className="text-sm">Photo de la pièce</Label>
            {backgroundImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img
                  src={backgroundImage}
                  alt="Aperçu"
                  className="w-full h-36 sm:h-48 object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 sm:h-8 sm:w-8"
                  onClick={() => setBackgroundImage(null)}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 sm:gap-2 bg-black/60 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm">
                  <Image className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Photo importée
                </div>
              </div>
            ) : (
              <div
                className={`
                  flex flex-col items-center justify-center gap-3 sm:gap-4 p-6 sm:p-8 border-2 border-dashed rounded-lg
                  transition-colors cursor-pointer h-36 sm:h-48
                  ${isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                  }
                `}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="h-5 w-5 sm:h-7 sm:w-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Cliquez pour importer une photo
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                    ou glissez-déposez votre image ici
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PNG ou JPEG uniquement</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg"
                  className="hidden"
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>

          {/* Largeur de la pièce */}
          <div className="space-y-2">
            <Label htmlFor="roomWidth">Largeur de la pièce (mètres)</Label>
            <p className="text-xs text-muted-foreground">
              Estimez la largeur visible sur votre photo pour un dimensionnement réaliste des meubles.
            </p>
            <Input
              id="roomWidth"
              type="number"
              min="1"
              max="20"
              step="0.5"
              value={roomWidth}
              onChange={(e) => setRoomWidth(parseFloat(e.target.value) || 4)}
              placeholder="4"
            />
          </div>

          {/* Boutons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
            <Button variant="outline" className="flex-1 h-10 sm:h-11 text-sm" onClick={handleClose}>
              Annuler
            </Button>
            <Button
              className="flex-1 h-10 sm:h-11 text-sm gradient-gold text-accent-foreground hover:opacity-90"
              onClick={handleCreate}
              disabled={isCreating || !projectName.trim() || !backgroundImage}
            >
              {isCreating ? "Création..." : "Créer le projet"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
