import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Scene3D } from "../components/editor/Scene3D";
import { FurnitureCatalog } from "../components/editor/FurnitureCatalog";
import { EditorToolbar } from "../components/editor/EditorToolbar";
import type { FurniturePlacement } from "../components/editor/FurnitureItem";
import { toast } from "sonner";
import { ArrowLeft, Box, PanelRightClose, PanelRightOpen } from "lucide-react";

const Editor = () => {
  const navigate = useNavigate();
  const [placements, setPlacements] = useState<FurniturePlacement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(true);
  const [roomDimensions] = useState({ width: 10, depth: 10, height: 3 });

  const selectedPlacement = placements.find(p => p.id === selectedId) || null;

  const handleAddFurniture = useCallback((furniture: {
    id: string;
    name: string;
    color: string;
    dimensions: { width: number; height: number; depth: number };
  }) => {
    const newPlacement: FurniturePlacement = {
      id: crypto.randomUUID(),
      furnitureId: furniture.id,
      name: furniture.name,
      position: [0, furniture.dimensions.height / 2, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color: furniture.color,
      dimensions: furniture.dimensions,
    };
    setPlacements(prev => [...prev, newPlacement]);
    setSelectedId(newPlacement.id);
    toast.success(`${furniture.name} ajouté à la scène`);
  }, []);

  const handleSelectFurniture = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const handlePositionChange = useCallback((id: string, position: [number, number, number]) => {
    setPlacements(prev =>
      prev.map(p => (p.id === id ? { ...p, position } : p))
    );
  }, []);

  const handleRotate = useCallback((direction: "left" | "right") => {
    if (!selectedId) return;
    const angle = direction === "left" ? Math.PI / 4 : -Math.PI / 4;
    setPlacements(prev =>
      prev.map(p =>
        p.id === selectedId
          ? { ...p, rotation: [p.rotation[0], p.rotation[1] + angle, p.rotation[2]] as [number, number, number] }
          : p
      )
    );
  }, [selectedId]);

  const handleMove = useCallback((axis: "x" | "y" | "z", value: number) => {
    if (!selectedId) return;
    setPlacements(prev =>
      prev.map(p => {
        if (p.id !== selectedId) return p;
        const newPosition: [number, number, number] = [...p.position];
        const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;
        newPosition[axisIndex] = value;
        return { ...p, position: newPosition };
      })
    );
  }, [selectedId]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    const placement = placements.find(p => p.id === selectedId);
    setPlacements(prev => prev.filter(p => p.id !== selectedId));
    setSelectedId(null);
    if (placement) {
      toast.success(`${placement.name} supprimé`);
    }
  }, [selectedId, placements]);

  const handleSave = useCallback(() => {
    // TODO: Save to database
    toast.success("Projet sauvegardé");
  }, []);

  const handleReset = useCallback(() => {
    setPlacements([]);
    setSelectedId(null);
    toast.info("Scène réinitialisée");
  }, []);

  return (
    <div className="h-screen flex flex-col bg-muted">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-background border-b border-border">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">RoomViz</span>
          </div>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">Nouveau projet</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsCatalogOpen(!isCatalogOpen)}
        >
          {isCatalogOpen ? (
            <>
              <PanelRightClose className="h-4 w-4 mr-2" />
              Masquer le catalogue
            </>
          ) : (
            <>
              <PanelRightOpen className="h-4 w-4 mr-2" />
              Afficher le catalogue
            </>
          )}
        </Button>
      </header>

      {/* Toolbar */}
      <EditorToolbar
        selectedPlacement={selectedPlacement}
        onRotate={handleRotate}
        onMove={handleMove}
        onDelete={handleDelete}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* 3D Scene */}
        <div className="flex-1 p-4">
          <Scene3D
            placements={placements}
            selectedId={selectedId}
            onSelectFurniture={handleSelectFurniture}
            onPositionChange={handlePositionChange}
            roomDimensions={roomDimensions}
          />
        </div>

        {/* Catalog sidebar */}
        {isCatalogOpen && (
          <div className="w-80">
            <FurnitureCatalog onAddFurniture={handleAddFurniture} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;
