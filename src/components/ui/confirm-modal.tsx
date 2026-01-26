import { Button } from "./button";
import { Card, CardContent, CardHeader } from "./card";
import { X, AlertTriangle, Info } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
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
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                variant === "danger" ? "bg-destructive/10" : "bg-primary/10"
              }`}
            >
              {variant === "danger" ? (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              ) : (
                <Info className="h-5 w-5 text-primary" />
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
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
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {message}
          </p>

          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              className="flex-1 h-10 sm:h-11 text-sm"
              onClick={onClose}
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              variant={variant === "danger" ? "destructive" : "default"}
              className={`flex-1 h-10 sm:h-11 text-sm ${variant !== "danger" ? "gradient-gold text-accent-foreground hover:opacity-90" : ""}`}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Chargement..." : confirmText}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
