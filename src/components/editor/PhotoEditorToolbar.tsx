import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import {
  RotateCcw,
  RotateCw,
  Trash2,
  Save,
  ZoomIn,
  ZoomOut,
  Settings,
  ImagePlus,
  ImageOff,
  Loader2,
  Box,
  Layers,
  SlidersHorizontal,
  Focus,
} from "lucide-react";
import type { CalibrationStep } from "@/types/perspective";

interface FurnitureItem2D {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  scale: number;
}

interface PhotoEditorToolbarProps {
  selectedItem: FurnitureItem2D | null;
  backgroundImage: string | null;
  onImageUpload: (imageUrl: string) => void;
  onRemoveImage: () => void;
  onRotate: (direction: "left" | "right") => void;
  onScale: (scale: number) => void;
  onDelete: () => void;
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  viewMode: '3d' | 'hybrid';
  onToggleViewMode: () => void;
  onSetViewMode?: (mode: '3d' | 'hybrid') => void;
  onCalibrate?: () => void;
  calibrationStep?: CalibrationStep;
  onTogglePerspective?: () => void;
  isPerspectiveOpen?: boolean;
}

export const PhotoEditorToolbar = ({
  selectedItem,
  backgroundImage,
  onImageUpload,
  onRemoveImage,
  onRotate,
  onScale,
  onDelete,
  onSave,
  onReset,
  isSaving = false,
  viewMode,
  onToggleViewMode,
  onSetViewMode,
  onCalibrate,
  calibrationStep = 'idle',
  onTogglePerspective,
  isPerspectiveOpen = false,
}: PhotoEditorToolbarProps) => {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setIsOptionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (file && allowedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onImageUpload(event.target.result as string);
          setIsOptionsOpen(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-2 md:gap-4 px-1.5 sm:px-2 md:px-4 py-1.5 sm:py-2 bg-background border-b border-border overflow-x-auto scrollbar-none">
      {/* Menu Options */}
      <div className="relative shrink-0" ref={optionsRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="h-7 sm:h-9 px-1.5 sm:px-3"
        >
          <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden sm:inline text-xs sm:text-sm">Options</span>
        </Button>

        {isOptionsOpen && (
          <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px] sm:min-w-[180px]">
            <button
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left hover:bg-muted flex items-center gap-2 active:bg-muted/80"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              <div>
                <span className="text-xs sm:text-sm">{backgroundImage ? "Change photo" : "Import photo"}</span>
                <p className="text-xs text-muted-foreground">PNG ou JPEG</p>
              </div>
            </button>
            {backgroundImage && (
              <button
                className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted flex items-center gap-2 text-destructive active:bg-muted/80"
                onClick={() => {
                  onRemoveImage();
                  setIsOptionsOpen(false);
                }}
              >
                <ImageOff className="h-4 w-4" />
                Remove photo
              </button>
            )}
            <div className="h-px bg-border my-1" />
            <button
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted flex items-center gap-2 text-destructive active:bg-muted/80"
              onClick={() => {
                onReset();
                setIsOptionsOpen(false);
              }}
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Toggle view mode: Hybrid / 3D */}
      <div className="flex items-center rounded-md border border-border overflow-hidden shrink-0">
        <Button
          variant={viewMode === 'hybrid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onSetViewMode ? onSetViewMode('hybrid') : onToggleViewMode()}
          className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-none border-0"
          title="Hybrid mode (3D furniture on photo)"
          disabled={!backgroundImage}
        >
          <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden md:inline text-xs">Hybrid</span>
        </Button>
        <div className="w-px h-5 sm:h-6 bg-border" />
        <Button
          variant={viewMode === '3d' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onSetViewMode ? onSetViewMode('3d') : onToggleViewMode()}
          className="h-7 sm:h-9 px-1.5 sm:px-3 rounded-none border-0"
          title="3D mode (virtual room)"
        >
          <Box className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
          <span className="hidden md:inline text-xs">3D</span>
        </Button>
      </div>

      {/* Calibration + Perspective buttons (hybrid mode only) */}
      {viewMode === 'hybrid' && (
        <>
          <Button
            variant={calibrationStep !== 'idle' ? 'default' : 'outline'}
            size="sm"
            onClick={onCalibrate}
            className="h-7 sm:h-9 px-1.5 sm:px-3 shrink-0"
            title="Calibrate perspective"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden md:inline text-xs">Calibrate</span>
          </Button>
          <Button
            variant={isPerspectiveOpen ? 'default' : 'outline'}
            size="sm"
            onClick={onTogglePerspective}
            className="h-7 sm:h-9 px-1.5 sm:px-3 shrink-0 md:hidden"
            title="Perspective settings"
          >
            <Focus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </>
      )}

      <div className="h-5 sm:h-6 w-px bg-border shrink-0 hidden sm:block" />

      {/* Selection controls */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <span className={`text-xs font-medium truncate max-w-[100px] ${selectedItem ? 'text-foreground' : 'text-muted-foreground'}`}>
          {selectedItem ? selectedItem.name : 'No furniture'}
        </span>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRotate("left")}
          title="Rotate left"
          disabled={!selectedItem}
          className="h-7 w-7 sm:h-9 sm:w-9"
        >
          <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRotate("right")}
          title="Rotate right"
          disabled={!selectedItem}
          className="h-7 w-7 sm:h-9 sm:w-9"
        >
          <RotateCw className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      <div className={`flex items-center gap-1 shrink-0 ${!selectedItem ? 'opacity-50' : ''}`}>
        <ZoomOut className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
        <Slider
          value={[selectedItem?.scale ?? 1]}
          onValueChange={([value]) => onScale(value)}
          min={0.3}
          max={2}
          step={0.1}
          className="w-12 sm:w-20 md:w-24"
          disabled={!selectedItem}
        />
        <ZoomIn className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
      </div>

      <div className="h-5 sm:h-6 w-px bg-border shrink-0" />

      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={!selectedItem}
        className="h-7 sm:h-9 px-1.5 sm:px-3 shrink-0"
      >
        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      <div className="flex-1 min-w-0" />

      {/* Global actions */}
      <Button
        size="sm"
        onClick={onSave}
        disabled={isSaving}
        className="h-7 sm:h-9 px-1.5 sm:px-3 gradient-gold text-accent-foreground hover:opacity-90 shrink-0"
      >
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
        ) : (
          <>
            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
            <span className="hidden sm:inline text-xs sm:text-sm">Save</span>
          </>
        )}
      </Button>
    </div>
  );
};
