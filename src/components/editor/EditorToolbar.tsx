import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
  Home,
} from "lucide-react";
import type { FurniturePlacement } from "./FurnitureItem";

interface EditorToolbarProps {
  selectedPlacement: FurniturePlacement | null;
  onRotate: (direction: "left" | "right") => void;
  onMove: (axis: "x" | "y" | "z", value: number) => void;
  onDelete: () => void;
  onSave: () => void;
  onReset: () => void;
}

export const EditorToolbar = ({
  selectedPlacement,
  onRotate,
  onMove,
  onDelete,
  onSave,
  onReset,
}: EditorToolbarProps) => {
  const hasSelection = selectedPlacement !== null;

  return (
    <div className="flex items-center gap-2 p-3 bg-background border-b border-border">
      {/* General actions */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onReset}>
              <Home className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Réinitialiser la vue</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={onSave}>
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sauvegarder le projet</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Selection tools */}
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasSelection}
              onClick={() => onRotate("left")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rotation gauche</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              disabled={!hasSelection}
              onClick={() => onRotate("right")}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Rotation droite</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              disabled={!hasSelection}
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Supprimer</TooltipContent>
        </Tooltip>
      </div>

      {/* Position controls */}
      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-8" />
          
          <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground w-6">X:</Label>
              <Slider
                value={[selectedPlacement.position[0]]}
                min={-5}
                max={5}
                step={0.1}
                className="w-20"
                onValueChange={([value]) => onMove("x", value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground w-6">Z:</Label>
              <Slider
                value={[selectedPlacement.position[2]]}
                min={-5}
                max={5}
                step={0.1}
                className="w-20"
                onValueChange={([value]) => onMove("z", value)}
              />
            </div>
          </div>
        </>
      )}

      {/* Selection info */}
      {hasSelection && (
        <div className="ml-auto text-sm text-muted-foreground">
          Sélection: <span className="text-foreground font-medium">{selectedPlacement.name}</span>
        </div>
      )}
    </div>
  );
};
