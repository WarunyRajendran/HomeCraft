import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader } from "../ui/card";
import { X, Settings } from "lucide-react";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  currentName: string;
  isLoading?: boolean;
}

export const ProjectSettingsModal = ({
  isOpen,
  onClose,
  onSave,
  currentName,
  isLoading = false,
}: ProjectSettingsModalProps) => {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">Paramètres du projet</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isLoading}
            className="h-8 w-8 sm:h-9 sm:w-9"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </CardHeader>

        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Nom du projet</Label>
              <Input
                id="projectName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mon projet"
                autoFocus
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-10 sm:h-11 text-sm"
                onClick={onClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 h-10 sm:h-11 text-sm gradient-gold text-accent-foreground hover:opacity-90"
                disabled={isLoading || !name.trim()}
              >
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
