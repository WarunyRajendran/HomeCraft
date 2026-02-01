/**
 * PerspectiveControls - Panneau de contrôle pour ajuster les paramètres de perspective
 * Permet de régler le FOV, la hauteur de caméra, l'inclinaison, etc.
 */

import { useCallback } from 'react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Camera,
  Move,
  RotateCw,
  Check,
  X,
  Ruler,
} from 'lucide-react';
import type { PerspectiveSettings, CalibrationStep } from '@/types/perspective';
import { DEFAULT_PERSPECTIVE_SETTINGS } from '@/types/perspective';

interface PerspectiveControlsProps {
  settings: PerspectiveSettings;
  onChange: (settings: PerspectiveSettings) => void;
  calibrationStep: CalibrationStep;
  onCalibrationStepChange: (step: CalibrationStep) => void;
}

export const PerspectiveControls = ({
  settings,
  onChange,
  calibrationStep,
  onCalibrationStepChange,
}: PerspectiveControlsProps) => {
  // Handler générique pour les changements de valeur
  const handleChange = useCallback(
    <K extends keyof PerspectiveSettings>(key: K, value: PerspectiveSettings[K]) => {
      onChange({ ...settings, [key]: value });
    },
    [settings, onChange]
  );

  const handleReset = () => {
    onChange(DEFAULT_PERSPECTIVE_SETTINGS);
  };

  // Les sliders sont désactivés uniquement pendant la définition des coins du sol
  const slidersDisabled = calibrationStep === 'floor-corners';

  return (
    <div className="bg-background border border-border rounded-lg p-4 space-y-4 min-w-[280px]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Paramètres de perspective
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-7 text-xs"
        >
          Réinitialiser
        </Button>
      </div>

      {/* Contrôles de caméra */}
      <div className="space-y-4">
        {/* FOV */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5">
              <Camera className="h-3.5 w-3.5" />
              Champ de vision
            </Label>
            <span className="text-xs text-muted-foreground">{settings.fov}°</span>
          </div>
          <Slider
            value={[settings.fov]}
            onValueChange={([value]) => handleChange('fov', value)}
            min={15}
            max={90}
            step={1}
            disabled={slidersDisabled}
          />
        </div>

        {/* Hauteur de caméra */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5">
              <Move className="h-3.5 w-3.5" />
              Hauteur de vue
            </Label>
            <span className="text-xs text-muted-foreground">
              {settings.cameraHeight.toFixed(1)}m
            </span>
          </div>
          <Slider
            value={[settings.cameraHeight]}
            onValueChange={([value]) => handleChange('cameraHeight', value)}
            min={0.5}
            max={3}
            step={0.1}
            disabled={slidersDisabled}
          />
        </div>

        {/* Inclinaison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs flex items-center gap-1.5">
              <RotateCw className="h-3.5 w-3.5" />
              Inclinaison
            </Label>
            <span className="text-xs text-muted-foreground">
              {settings.cameraTilt}°
            </span>
          </div>
          <Slider
            value={[settings.cameraTilt]}
            onValueChange={([value]) => handleChange('cameraTilt', value)}
            min={-45}
            max={45}
            step={1}
            disabled={slidersDisabled}
          />
        </div>

        <div className="h-px bg-border" />

        {/* Dimensions du sol */}
        <div className="space-y-3">
          <Label className="text-xs flex items-center gap-1.5">
            <Ruler className="h-3.5 w-3.5" />
            Dimensions de la pièce
          </Label>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Largeur (m)
              </Label>
              <Input
                type="number"
                value={settings.floorWidth}
                onChange={(e) =>
                  handleChange('floorWidth', parseFloat(e.target.value) || 4)
                }
                min={1}
                max={20}
                step={0.5}
                className="h-8 text-sm"
                disabled={slidersDisabled}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Profondeur (m)
              </Label>
              <Input
                type="number"
                value={settings.floorDepth}
                onChange={(e) =>
                  handleChange('floorDepth', parseFloat(e.target.value) || 4)
                }
                min={1}
                max={20}
                step={0.5}
                className="h-8 text-sm"
                disabled={slidersDisabled}
              />
            </div>
          </div>
        </div>

        {/* Point de fuite (avancé) */}
        <details className="group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Options avancées
          </summary>
          <div className="mt-3 space-y-3 pl-2 border-l-2 border-border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Ligne d'horizon</Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(settings.horizonY * 100)}%
                </span>
              </div>
              <Slider
                value={[settings.horizonY]}
                onValueChange={([value]) => handleChange('horizonY', value)}
                min={0.1}
                max={0.9}
                step={0.01}
                disabled={slidersDisabled}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Point de fuite X
                </Label>
                <Input
                  type="number"
                  value={settings.vanishingPoint.x.toFixed(2)}
                  onChange={(e) =>
                    handleChange('vanishingPoint', {
                      ...settings.vanishingPoint,
                      x: parseFloat(e.target.value) || 0.5,
                    })
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  className="h-7 text-xs"
                  disabled={slidersDisabled}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  Point de fuite Y
                </Label>
                <Input
                  type="number"
                  value={settings.vanishingPoint.y.toFixed(2)}
                  onChange={(e) =>
                    handleChange('vanishingPoint', {
                      ...settings.vanishingPoint,
                      y: parseFloat(e.target.value) || 0.4,
                    })
                  }
                  min={0}
                  max={1}
                  step={0.01}
                  className="h-7 text-xs"
                  disabled={slidersDisabled}
                />
              </div>
            </div>
          </div>
        </details>
      </div>

      {/* Boutons de validation pendant la calibration */}
      {calibrationStep === 'perspective' && (
        <>
          <div className="h-px bg-border" />
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCalibrationStepChange('idle')}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-1" />
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={() => onCalibrationStepChange('idle')}
              className="flex-1 gradient-gold text-accent-foreground"
            >
              <Check className="h-4 w-4 mr-1" />
              Appliquer
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
