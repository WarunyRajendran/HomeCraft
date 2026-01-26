import { useRef, useState } from "react";
import { Button } from "../ui/button";
import { Upload, Image, X } from "lucide-react";

interface ImageUploaderProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage: string | null;
  onRemoveImage: () => void;
}

export const ImageUploader = ({ onImageUpload, currentImage, onRemoveImage }: ImageUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (file: File) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];

    if (file && allowedTypes.includes(file.type)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageUpload(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
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

  if (currentImage) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg">
        <Image className="h-4 w-4 text-primary" />
        <span className="text-sm text-foreground">Photo importée</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onRemoveImage}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg 
        transition-colors cursor-pointer
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
      <Upload className="h-5 w-5 text-muted-foreground" />
      <div className="text-sm">
        <span className="text-foreground font-medium">Importer une photo</span>
        <span className="text-muted-foreground"> ou glisser-déposer</span>
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
  );
};
