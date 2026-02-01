import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Scene3D } from "../components/editor/Scene3D";
import { HybridScene } from "../components/editor/HybridScene";
import { FurnitureCatalog } from "../components/editor/FurnitureCatalog";
import { PhotoEditorToolbar } from "../components/editor/PhotoEditorToolbar";
import { ProjectSettingsModal } from "../components/editor/ProjectSettingsModal";
import { PerspectiveControls } from "../components/editor/PerspectiveControls";
import { toast } from "sonner";
import { ArrowLeft, Box, PanelRightClose, PanelRightOpen, Settings } from "lucide-react";
import { useProject, useCreateProject, useUpdateProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import type { FurniturePlacement } from "../components/editor/FurnitureItem";
import type { PerspectiveSettings, CalibrationStep, HybridFurniturePlacement } from "@/types/perspective";
import { DEFAULT_PERSPECTIVE_SETTINGS } from "@/types/perspective";

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
  modelUrl: string | null;
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
  const [projectName, setProjectName] = useState<string>("");
  const [roomWidth, setRoomWidth] = useState<number>(4); // Largeur par défaut: 4 mètres
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'hybrid'>('hybrid');
  const [perspectiveSettings, setPerspectiveSettings] = useState<PerspectiveSettings>(DEFAULT_PERSPECTIVE_SETTINGS);
  const [calibrationStep, setCalibrationStep] = useState<CalibrationStep>('idle');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showGrid, _setShowGrid] = useState(false);
  const [isPerspectiveOpen, setIsPerspectiveOpen] = useState(false);

  // Fetch project if editing
  const { data: project, isLoading: projectLoading } = useProject(projectId);

  // Mutations
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const selectedItem = furniture.find(f => f.id === selectedId) || null;

  // Conversion function from 2D to 3D placements
  const convertTo3DPlacements = useCallback((items: FurnitureItem2D[]): FurniturePlacement[] => {
    // Canvas = 10 unités de large, roomWidth = largeur de la pièce en mètres
    const CANVAS_WIDTH = 10;
    const scaleFactor = roomWidth / CANVAS_WIDTH; // Inverse pour revenir aux mètres

    return items.map(item => ({
      id: item.id,
      furnitureId: item.id,
      name: item.name,
      position: [
        item.x * scaleFactor,
        (item.height * scaleFactor * item.scale) / 2, // Y = hauteur/2 pour poser au sol
        item.y * scaleFactor
      ] as [number, number, number],
      rotation: [0, item.rotation, 0] as [number, number, number],
      scale: [item.scale, item.scale, item.scale] as [number, number, number],
      color: item.color,
      modelUrl: item.modelUrl,
      dimensions: {
        width: item.width * scaleFactor * item.scale,
        height: item.height * scaleFactor * item.scale,
        depth: item.height * scaleFactor * item.scale * 0.5 // Estimation de la profondeur
      }
    }));
  }, [roomWidth]);

  // Handler for 3D position updates
  const handlePositionChange3D = useCallback((id: string, position: [number, number, number]) => {
    const CANVAS_WIDTH = 10;
    const scaleFactor = CANVAS_WIDTH / roomWidth; // Pour revenir aux unités canvas

    setFurniture(prev => prev.map(item =>
      item.id === id
        ? { ...item, x: position[0] * scaleFactor, y: position[2] * scaleFactor }
        : item
    ));
  }, [roomWidth]);

  // Toggle view mode
  const handleToggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'hybrid' ? '3d' : 'hybrid');
  }, []);

  // Set specific view mode
  const handleSetViewMode = useCallback((mode: '3d' | 'hybrid') => {
    setViewMode(mode);
    // Reset calibration when leaving hybrid mode
    if (mode !== 'hybrid') {
      setCalibrationStep('idle');
    }
  }, []);

  // Start calibration
  const handleCalibrate = useCallback(() => {
    setCalibrationStep(prev => prev === 'idle' ? 'floor-corners' : 'idle');
    setIsPerspectiveOpen(false);
  }, []);

  // Conversion function from 2D to Hybrid 3D placements
  const convertToHybridPlacements = useCallback((items: FurnitureItem2D[]): HybridFurniturePlacement[] => {
    const { floorWidth, floorDepth } = perspectiveSettings;
    // Canvas = 10 unités de large, mapper vers les dimensions du sol réel
    const CANVAS_WIDTH = 10;
    const scaleFactorX = floorWidth / CANVAS_WIDTH;
    const scaleFactorZ = floorDepth / (CANVAS_WIDTH * 0.75); // CANVAS_HEIGHT = 7.5

    // Debug: log input items
    console.log('[convertToHybridPlacements] Input items:', items.map(i => ({ id: i.id, name: i.name, modelUrl: i.modelUrl })));

    return items.map(item => {
      const scaledWidth = item.width * scaleFactorX * item.scale;
      const scaledHeight = item.height * scaleFactorZ * item.scale;
      const scaledDepth = item.height * scaleFactorZ * 0.5 * item.scale;

      // Pour les modèles GLTF, Y=0 car l'origine est généralement au sol
      // Pour les fallback boxes, Y = hauteur/2 car l'origine est au centre
      const yPos = item.modelUrl ? 0 : scaledHeight / 2;

      return {
        id: item.id,
        furnitureId: item.id,
        name: item.name,
        position: [
          item.x * scaleFactorX, // X
          yPos, // Y (0 pour GLTF, hauteur/2 pour fallback)
          -item.y * scaleFactorZ, // Z (inversé car Y 2D va vers le bas)
        ] as [number, number, number],
        rotation: [0, item.rotation, 0] as [number, number, number],
        scale: [item.scale, item.scale, item.scale] as [number, number, number],
        color: item.color,
        modelUrl: item.modelUrl,
        imageUrl: item.imageUrl,
        dimensions: {
          width: scaledWidth,
          height: scaledHeight,
          depth: scaledDepth,
        },
      };
    });
  }, [perspectiveSettings]);

  // Handler for hybrid mode position updates
  const handlePositionChangeHybrid = useCallback((id: string, position: [number, number, number]) => {
    const { floorWidth, floorDepth } = perspectiveSettings;
    const CANVAS_WIDTH = 10;
    const scaleFactorX = CANVAS_WIDTH / floorWidth;
    const scaleFactorZ = (CANVAS_WIDTH * 0.75) / floorDepth;

    setFurniture(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            x: position[0] * scaleFactorX,
            y: -position[2] * scaleFactorZ, // Inversé car Z 3D va vers l'arrière
          }
        : item
    ));
  }, [perspectiveSettings]);

  // Load project data when available
  useEffect(() => {
    if (project) {
      if (project.furniture_placements) {
        // Debug: log loaded furniture placements
        console.log('[Editor] Loading furniture_placements:', project.furniture_placements);
        setFurniture(project.furniture_placements as unknown as FurnitureItem2D[]);
      }
      const roomData = project.room_data as {
        backgroundImage?: string;
        roomWidth?: number;
        perspectiveSettings?: PerspectiveSettings;
      } | null;
      setBackgroundImage(roomData?.backgroundImage || null);
      setRoomWidth(roomData?.roomWidth || 4);
      setProjectName(project.name || "");
      // Load perspective settings if available
      if (roomData?.perspectiveSettings) {
        setPerspectiveSettings(roomData.perspectiveSettings);
      }
    }
  }, [project]);

  const handleAddFurniture = useCallback((item: {
    id: string;
    name: string;
    color: string;
    imageUrl: string | null;
    modelUrl: string | null;
    dimensions: { width: number; height: number; depth: number };
  }) => {
    // Canvas = 10 unités de large, roomWidth = largeur de la pièce en mètres
    // Facteur d'échelle = 10 / roomWidth (ex: pièce de 4m → 2.5 unités/mètre)
    const CANVAS_WIDTH = 10;
    const scaleFactor = CANVAS_WIDTH / roomWidth;

    const newItem: FurnitureItem2D = {
      id: generateUUID(),
      name: item.name,
      x: 0,
      y: 0,
      width: item.dimensions.width * scaleFactor,
      height: item.dimensions.depth * scaleFactor,
      rotation: 0,
      color: item.color,
      imageUrl: item.imageUrl,
      modelUrl: item.modelUrl,
      scale: 1,
    };
    setFurniture(prev => [...prev, newItem]);
    setSelectedId(newItem.id);
    toast.success(`${item.name} ajouté`);
  }, [roomWidth]);

  const handleSelectFurniture = useCallback((id: string | null) => {
    setSelectedId(id);
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
      toast.error("You must be logged in to save");
      return;
    }

    const projectData = {
      user_id: user.id,
      name: projectName || `Projet ${new Date().toLocaleDateString()}`,
      room_data: { backgroundImage, roomWidth, perspectiveSettings },
      furniture_placements: furniture,
      room_image_url: backgroundImage,
    };

    try {
      if (projectId) {
        // Update existing
        await updateProject.mutateAsync({ id: projectId, data: projectData });
        toast.success("Project updated");
      } else {
        // Create new
        const newProject = await createProject.mutateAsync(projectData);
        toast.success("Project created");
        navigate(`/editor/${newProject.id}`, { replace: true });
      }
    } catch (error) {
      toast.error("Error saving project");
      console.error(error);
    }
  }, [user, projectId, backgroundImage, furniture, projectName, roomWidth, perspectiveSettings, createProject, updateProject, navigate]);

  const handleSaveProjectSettings = useCallback(async (newName: string) => {
    setProjectName(newName);
    setIsSettingsModalOpen(false);

    // Si le projet existe déjà, sauvegarder immédiatement les paramètres
    if (projectId && user) {
      try {
        await updateProject.mutateAsync({
          id: projectId,
          data: {
            name: newName
          }
        });
        toast.success("Project name updated");
      } catch (error) {
        toast.error("Error updating");
        console.error(error);
      }
    }
  }, [projectId, user, updateProject]);

  const handleReset = useCallback(() => {
    setFurniture([]);
    setSelectedId(null);
    setBackgroundImage(null);
    toast.info("Scene reset");
  }, []);

  // Show loading state
  if (projectId && projectLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 bg-background border-b border-border">
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")} className="h-8 w-8 sm:h-9 sm:w-9">
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-gold flex items-center justify-center">
              <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-sm sm:text-base text-foreground hidden sm:inline">HomeCraft</span>
          </div>
          <span className="text-muted-foreground hidden md:inline">|</span>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="max-w-[100px] sm:max-w-[150px] truncate">
              {projectName || "New project"}
            </span>
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCatalogOpen(!isCatalogOpen)}
          className="text-xs h-8 sm:h-9 px-2 sm:px-3"
        >
          {isCatalogOpen ? (
            <>
              <PanelRightClose className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1 md:mr-2" />
              <span className="hidden sm:inline lg:hidden text-xs sm:text-sm">Masquer</span>
              <span className="hidden lg:inline text-xs sm:text-sm">Masquer le catalogue</span>
            </>
          ) : (
            <>
              <PanelRightOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1 md:mr-2" />
              <span className="hidden sm:inline lg:hidden text-xs sm:text-sm">Afficher</span>
              <span className="hidden lg:inline text-xs sm:text-sm">Afficher le catalogue</span>
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
        isSaving={createProject.isPending || updateProject.isPending}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onSetViewMode={handleSetViewMode}
        onCalibrate={handleCalibrate}
        calibrationStep={calibrationStep}
        onTogglePerspective={() => setIsPerspectiveOpen(prev => !prev)}
        isPerspectiveOpen={isPerspectiveOpen}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* 3D Scene / Hybrid Scene */}
        <div className="h-[35vh] sm:h-[40vh] md:h-auto md:flex-1 p-1.5 sm:p-2 md:p-4 shrink-0 md:shrink min-w-0 touch-none">
          {viewMode === '3d' && (
            <Scene3D
              placements={convertTo3DPlacements(furniture)}
              selectedId={selectedId}
              onSelectFurniture={handleSelectFurniture}
              onPositionChange={handlePositionChange3D}
              roomDimensions={{ width: roomWidth, depth: roomWidth, height: 3 }}
            />
          )}
          {viewMode === 'hybrid' && backgroundImage && (
            <HybridScene
              backgroundImage={backgroundImage}
              placements={convertToHybridPlacements(furniture)}
              selectedId={selectedId}
              onSelectFurniture={handleSelectFurniture}
              onPositionChange={handlePositionChangeHybrid}
              perspectiveSettings={perspectiveSettings}
              onPerspectiveChange={setPerspectiveSettings}
              calibrationStep={calibrationStep}
              onCalibrationStepChange={setCalibrationStep}
              showGrid={showGrid}
            />
          )}
          {viewMode === 'hybrid' && !backgroundImage && (
            <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">Hybrid Mode</p>
                <p className="text-sm mt-2">Upload a room photo to get started</p>
              </div>
            </div>
          )}
        </div>

        {/* Perspective Controls (hybrid mode only) - drawer on mobile, sidebar on desktop */}
        {viewMode === 'hybrid' && (
          <>
            {/* Mobile: drawer overlay */}
            <div
              className={`md:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
                isPerspectiveOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="absolute inset-0 bg-black/40" onClick={() => setIsPerspectiveOpen(false)} />
              <div
                className={`absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 max-h-[70vh] overflow-auto transition-transform duration-300 ${
                  isPerspectiveOpen ? 'translate-y-0' : 'translate-y-full'
                }`}
              >
                <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
                <PerspectiveControls
                  settings={perspectiveSettings}
                  onChange={setPerspectiveSettings}
                  calibrationStep={calibrationStep}
                  onCalibrationStepChange={setCalibrationStep}
                />
              </div>
            </div>
            {/* Desktop: sidebar */}
            <aside className="hidden md:block md:shrink-0 border-l border-border overflow-auto p-2 w-auto">
              <PerspectiveControls
                settings={perspectiveSettings}
                onChange={setPerspectiveSettings}
                calibrationStep={calibrationStep}
                onCalibrationStepChange={setCalibrationStep}
              />
            </aside>
          </>
        )}

        {/* Catalog sidebar */}
        <aside
          className={`md:shrink-0 border-t md:border-t-0 md:border-l border-border overflow-hidden self-stretch will-change-[max-height,width,opacity] transition-[max-height,width,opacity] duration-300 ease-in-out ${
            isCatalogOpen
              ? 'max-h-[60vh] md:max-h-none w-full md:w-72 lg:w-80 md:flex-none opacity-100'
              : 'max-h-0 md:max-h-none md:w-0 flex-none opacity-0'
          }`}
        >
          <div className="w-full md:w-72 lg:w-80 h-full min-h-[300px] sm:min-h-[350px] md:min-h-0 overflow-auto">
            <FurnitureCatalog onAddFurniture={handleAddFurniture} />
          </div>
        </aside>
      </div>

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={handleSaveProjectSettings}
        currentName={projectName}
        isLoading={updateProject.isPending}
      />
    </div>
  );
};

export default Editor;
