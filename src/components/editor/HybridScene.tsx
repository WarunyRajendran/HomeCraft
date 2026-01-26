/**
 * HybridScene - Scène principale du mode hybride
 * Superpose un canvas Three.js transparent sur une photo de pièce
 */

import { useMemo, useState, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { PerspectiveSettings, HybridFurniturePlacement, CalibrationStep } from '@/types/perspective';
import { DEFAULT_PERSPECTIVE_SETTINGS } from '@/types/perspective';
import { createFloorPlane } from '@/lib/perspectiveUtils';
import { ShadowCatcher, CalibrationGrid } from './ShadowCatcher';
import { HybridFurnitureItem } from './HybridFurnitureItem';
import { FloorPlaneConfigurator } from './FloorPlaneConfigurator';

interface HybridSceneProps {
  backgroundImage: string;
  placements: HybridFurniturePlacement[];
  selectedId: string | null;
  onSelectFurniture: (id: string | null) => void;
  onPositionChange: (id: string, position: [number, number, number]) => void;
  perspectiveSettings: PerspectiveSettings;
  onPerspectiveChange?: (settings: PerspectiveSettings) => void;
  calibrationStep: CalibrationStep;
  onCalibrationStepChange?: (step: CalibrationStep) => void;
  showGrid?: boolean;
}

/**
 * Composant interne pour la caméra contrôlée par les paramètres de perspective
 */
const PerspectiveControlledCamera = ({
  settings,
}: {
  settings: PerspectiveSettings;
}) => {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);

  // Calculer la configuration de la caméra à partir des paramètres
  const cameraConfig = useMemo(() => {
    const { fov, cameraHeight, cameraTilt, horizonY, floorDepth } = settings;

    // Convertir l'inclinaison en radians
    const tiltRadians = THREE.MathUtils.degToRad(cameraTilt);

    // La ligne d'horizon affecte la distance de la caméra
    // horizonY proche de 0 = caméra plus loin et plus haute
    // horizonY proche de 1 = caméra plus proche et plus basse
    const horizonFactor = 1 + (0.5 - horizonY) * 2;

    // Distance horizontale basée sur la profondeur du sol et l'horizon
    const baseDistance = floorDepth * 1.5;
    const horizontalDistance = baseDistance * horizonFactor;

    // Position de la caméra - À NEGATIVE Z (devant la scène, regardant vers l'arrière)
    // Cela correspond à la perspective d'une photo prise dans une pièce
    const position: [number, number, number] = [
      0,
      cameraHeight * horizonFactor,
      -horizontalDistance, // Négatif pour être "devant" la scène
    ];

    // Point de visée: vers l'arrière de la pièce (Z positif)
    const lookAtY = Math.tan(tiltRadians) * horizontalDistance;
    const lookAt: [number, number, number] = [0, lookAtY, floorDepth / 2];

    return { position, lookAt, fov };
  }, [settings]);

  // Mettre à jour la caméra quand les paramètres changent
  useFrame(() => {
    if (cameraRef.current) {
      // Interpolation douce vers la nouvelle position
      const targetPos = new THREE.Vector3(...cameraConfig.position);
      cameraRef.current.position.lerp(targetPos, 0.15);

      // Appliquer le FOV avec interpolation
      const targetFov = cameraConfig.fov;
      if (Math.abs(cameraRef.current.fov - targetFov) > 0.1) {
        cameraRef.current.fov = THREE.MathUtils.lerp(
          cameraRef.current.fov,
          targetFov,
          0.15
        );
        cameraRef.current.updateProjectionMatrix();
      }

      // Point de visée avec interpolation
      const targetLookAt = new THREE.Vector3(...cameraConfig.lookAt);
      const currentLookAt = new THREE.Vector3();
      cameraRef.current.getWorldDirection(currentLookAt);
      currentLookAt.multiplyScalar(10).add(cameraRef.current.position);
      currentLookAt.lerp(targetLookAt, 0.15);
      cameraRef.current.lookAt(targetLookAt);
    }
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={cameraConfig.position}
      fov={cameraConfig.fov}
      near={0.1}
      far={100}
    />
  );
};

/**
 * Contenu de la scène 3D
 */
const SceneContent = ({
  placements,
  selectedId,
  onSelectFurniture,
  onPositionChange,
  perspectiveSettings,
  calibrationStep,
  showGrid,
  onDragChange,
}: Omit<HybridSceneProps, 'backgroundImage' | 'onPerspectiveChange' | 'onCalibrationStepChange'> & {
  onDragChange: (dragging: boolean) => void;
}) => {
  // Créer le plan du sol pour le raycasting
  const floorPlane = useMemo(() => createFloorPlane(), []);

  return (
    <>
      {/* Caméra perspective contrôlée */}
      <PerspectiveControlledCamera settings={perspectiveSettings} />

      {/* Éclairage optimisé pour les ombres */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Plan de capture des ombres - très grand pour couvrir tout le sol visible */}
      <ShadowCatcher
        width={perspectiveSettings.floorWidth * 4}
        depth={perspectiveSettings.floorDepth * 4}
        shadowOpacity={0.4}
        debug={calibrationStep !== 'idle'}
      />

      {/* Grille de calibration (visible pendant la calibration ou si showGrid) */}
      {(calibrationStep !== 'idle' || showGrid) && (
        <CalibrationGrid
          width={perspectiveSettings.floorWidth}
          depth={perspectiveSettings.floorDepth}
          divisions={10}
          opacity={calibrationStep !== 'idle' ? 0.7 : 0.3}
        />
      )}

      {/* Meubles 3D */}
      {placements.map((placement) => (
        <HybridFurnitureItem
          key={placement.id}
          placement={placement}
          isSelected={selectedId === placement.id}
          onSelect={onSelectFurniture}
          onPositionChange={onPositionChange}
          floorPlane={floorPlane}
          floorWidth={perspectiveSettings.floorWidth}
          floorDepth={perspectiveSettings.floorDepth}
          onDragChange={onDragChange}
        />
      ))}

      {/* Plan invisible pour déselectionner */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={() => onSelectFurniture(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </>
  );
};

export const HybridScene = ({
  backgroundImage,
  placements,
  selectedId,
  onSelectFurniture,
  onPositionChange,
  perspectiveSettings = DEFAULT_PERSPECTIVE_SETTINGS,
  onPerspectiveChange,
  calibrationStep = 'idle',
  onCalibrationStepChange,
  showGrid = false,
}: HybridSceneProps) => {
  // isDragging est conservé pour une future utilisation (changement de curseur, etc.)
  const [, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  // Gérer les changements de coins du sol pendant la calibration
  const handleFloorCornersChange = useCallback(
    (corners: PerspectiveSettings['floorCorners']) => {
      if (onPerspectiveChange) {
        onPerspectiveChange({
          ...perspectiveSettings,
          floorCorners: corners,
        });
      }
    },
    [perspectiveSettings, onPerspectiveChange]
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-muted rounded-lg overflow-hidden"
    >
      {/* Image de fond */}
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />

      {/* Canvas Three.js transparent par-dessus */}
      <Canvas
        className="absolute inset-0"
        gl={{
          alpha: true,
          antialias: true,
          preserveDrawingBuffer: true,
        }}
        shadows
        style={{ background: 'transparent' }}
        onPointerMissed={() => {
          if (calibrationStep === 'idle') {
            onSelectFurniture(null);
          }
        }}
      >
        <SceneContent
          placements={placements}
          selectedId={selectedId}
          onSelectFurniture={onSelectFurniture}
          onPositionChange={onPositionChange}
          perspectiveSettings={perspectiveSettings}
          calibrationStep={calibrationStep}
          showGrid={showGrid}
          onDragChange={handleDragChange}
        />
      </Canvas>

      {/* Overlay pour la définition des coins du sol */}
      {calibrationStep === 'floor-corners' && (
        <FloorPlaneConfigurator
          floorCorners={perspectiveSettings.floorCorners}
          onCornersChange={handleFloorCornersChange}
          onComplete={() => onCalibrationStepChange?.('perspective')}
        />
      )}

      {/* Indicateur de mode calibration */}
      {calibrationStep !== 'idle' && (
        <div className="absolute top-2 left-2 bg-black/70 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          {calibrationStep === 'floor-corners'
            ? 'Cliquez sur les 4 coins du sol'
            : 'Ajustez la perspective'}
        </div>
      )}
    </div>
  );
};
