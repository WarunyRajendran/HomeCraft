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
} from "lucide-react";

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
    if (file && file.type.startsWith("image/")) {
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
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-4 px-2 md:px-4 py-2 bg-background border-b border-border">
      {/* Menu Options */}
      <div className="relative" ref={optionsRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOptionsOpen(!isOptionsOpen)}
          className="h-8 sm:h-9 px-2 sm:px-3"
        >
          <Settings className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline text-xs sm:text-sm">Options</span>
        </Button>

        {isOptionsOpen && (
          <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg py-1 z-50 min-w-[160px] sm:min-w-[180px]">
            <button
              className="w-full px-3 sm:px-4 py-2.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted flex items-center gap-2 active:bg-muted/80"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4" />
              {backgroundImage ? "Changer la photo" : "Importer une photo"}
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
                Supprimer la photo
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
              Tout effacer
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="h-6 w-px bg-border hidden sm:block" />

      {/* Selection controls - toujours visibles, désactivés si rien n'est sélectionné */}
      <div className="hidden sm:flex items-center gap-2">
        <span className={`text-xs sm:text-sm font-medium truncate max-w-[100px] sm:max-w-[120px] ${selectedItem ? 'text-foreground' : 'text-muted-foreground'}`}>
          {selectedItem ? selectedItem.name : 'Aucun meuble'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRotate("left")}
          title="Pivoter à gauche"
          disabled={!selectedItem}
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onRotate("right")}
          title="Pivoter à droite"
          disabled={!selectedItem}
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      <div className={`hidden sm:flex items-center gap-2 ${!selectedItem ? 'opacity-50' : ''}`}>
        <ZoomOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        <Slider
          value={[selectedItem?.scale ?? 1]}
          onValueChange={([value]) => onScale(value)}
          min={0.3}
          max={2}
          step={0.1}
          className="w-16 sm:w-20 md:w-24"
          disabled={!selectedItem}
        />
        <ZoomIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
      </div>

      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={!selectedItem}
        className="h-8 sm:h-9 px-2 sm:px-3"
      >
        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
        <span className="hidden sm:inline text-xs sm:text-sm">Supprimer</span>
      </Button>

      <div className="flex-1" />

      {/* Global actions */}
      <Button size="sm" onClick={onSave} className="h-8 sm:h-9 px-2 sm:px-3">
        <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
        <span className="hidden sm:inline text-xs sm:text-sm">Sauvegarder</span>
      </Button>
    </div>
  );
};
