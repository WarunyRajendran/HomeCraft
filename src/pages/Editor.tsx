import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { PhotoScene } from "../components/editor/PhotoScene";
import { FurnitureCatalog } from "../components/editor/FurnitureCatalog";
import { PhotoEditorToolbar } from "../components/editor/PhotoEditorToolbar";
import { toast } from "sonner";
import { ArrowLeft, Box, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useProject, useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";

// Génère un UUID compatible avec tous les navigateurs
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les navigateurs qui ne supportent pas crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface FurnitureItem2D {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  imageUrl: string | null;
  scale: number;
}

const Editor = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  const [furniture, setFurniture] = useState<FurnitureItem2D[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // Fetch project if editing
  const { data: project, isLoading: projectLoading } = useProject(projectId);

  // Mutations
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const selectedItem = furniture.find(f => f.id === selectedId) || null;

  // Load project data when available
  useEffect(() => {
    if (project && project.furniture_placements) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFurniture(project.furniture_placements as unknown as FurnitureItem2D[]);
      const roomData = project.room_data as { backgroundImage?: string } | null;
      setBackgroundImage(roomData?.backgroundImage || null);
    }
  }, [project]);

  const handleAddFurniture = useCallback((item: {
    id: string;
    name: string;
    color: string;
    imageUrl: string | null;
    dimensions: { width: number; height: number; depth: number };
  }) => {
    const newItem: FurnitureItem2D = {
      id: generateUUID(),
      name: item.name,
      x: 0,
      y: 0,
      width: item.dimensions.width * 0.5,
      height: item.dimensions.depth * 0.5,
      rotation: 0,
      color: item.color,
      imageUrl: item.imageUrl,
      scale: 1,
    };
    setFurniture(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    toast.success(`${item.name} ajouté`);
  }, []);

  const handleSelectFurniture = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handleUpdateFurniture = useCallback((id: string, updates: Partial<FurnitureItem2D>) => {
    setFurniture(prev =>
      prev.map(f => (f.id === id ? { ...f, ...updates } : f))
    );
  }, []);

  const handleRotate = useCallback((direction: "left" | "right") => {
    if (!selectedId) return;
    const angle = direction === "left" ? Math.PI / 8 : -Math.PI / 8;
    setFurniture(prev =>
      prev.map(f =>
        f.id === selectedId ? { ...f, rotation: f.rotation + angle } : f
      )
    );
  }, [selectedId]);

  const handleScale = useCallback((scale: number) => {
    if (!selectedId) return;
    setFurniture(prev =>
      prev.map(f => (f.id === selectedId ? { ...f, scale } : f))
    );
  }, [selectedId]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    const item = furniture.find(f => f.id === selectedId);
    setFurniture(prev => prev.filter(f => f.id !== selectedId));
    setSelectedId(null);
    if (item) {
      toast.success(`${item.name} supprimé`);
    }
  }, [selectedId, furniture]);

  const handleSave = useCallback(async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour sauvegarder");
      return;
    }

    const projectData = {
      user_id: user.id,
      name: project?.name || `Projet ${new Date().toLocaleDateString()}`,
      room_data: { backgroundImage },
      furniture_placements: furniture,
      room_image_url: backgroundImage,
    };

    try {
      if (projectId) {
        // Update existing
        await updateProject.mutateAsync({ id: projectId, data: projectData });
        toast.success("Projet mis à jour");
      } else {
        // Create new
        const newProject = await createProject.mutateAsync(projectData);
        toast.success("Projet créé");
        navigate(`/editor/${newProject.id}`, { replace: true });
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
      console.error(error);
    }
  }, [user, projectId, backgroundImage, furniture, createProject, updateProject, navigate, project]);

  const handleReset = useCallback(() => {
    setFurniture([]);
    setSelectedId(null);
    setBackgroundImage(null);
    toast.info("Scène réinitialisée");
  }, []);

  // Show loading state
  if (projectId && projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted">
      {/* Header */}
      <header className="flex items-center justify-between px-2 md:px-4 py-2 bg-background border-b border-border">
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground hidden sm:inline">HomeCraft</span>
          </div>
          <span className="text-muted-foreground hidden md:inline">|</span>
          <span className="text-sm text-muted-foreground hidden md:inline">Éditeur Photo</span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          className="text-xs md:text-sm"
        >
          {isCatalogOpen ? (
            <>
              <PanelRightClose className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Masquer le catalogue</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Afficher le catalogue</span>
            </>
          )}
        </Button>
      </header>

      {/* Toolbar */}
      <PhotoEditorToolbar
        selectedItem={selectedItem}
        backgroundImage={backgroundImage}
        onImageUpload={setBackgroundImage}
        onRemoveImage={() => setBackgroundImage(null)}
        onRotate={handleRotate}
        onScale={handleScale}
        onDelete={handleDelete}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Photo Scene */}
        <div className="h-[45vh] md:h-auto md:flex-1 p-2 md:p-4 shrink-0 md:shrink min-w-0">
          <PhotoScene
            backgroundImage={backgroundImage}
            furniture={furniture}
            selectedId={selectedId}
            onSelectFurniture={handleSelectFurniture}
            onUpdateFurniture={handleUpdateFurniture}
          />
        </div>

        {/* Catalog sidebar */}
        <aside
          className={`md:shrink-0 border-t md:border-t-0 md:border-l border-border overflow-hidden self-stretch transition-all duration-300 ease-in-out ${
            isCatalogOpen
              ? 'w-full md:w-80 min-h-[300px] md:min-h-0 flex-1 md:flex-none opacity-100'
              : 'w-0 min-h-0 flex-none opacity-0 border-0'
          }`}
        >
          <div className="w-full md:w-80 h-full overflow-auto">
            <FurnitureCatalog onAddFurniture={handleAddFurniture} />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
