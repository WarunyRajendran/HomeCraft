/**
 * HybridFurnitureItem - Meuble 3D pour le mode hybride (3D sur photo 2D)
 * Supporte le drag & drop en perspective et les ombres réalistes
 */

import { useRef, useState, useEffect, Suspense, Component } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { HybridFurniturePlacement } from '@/types/perspective';
import { calculateFurnitureYPosition } from '@/lib/perspectiveUtils';

/**
 * ErrorBoundary pour capturer les erreurs de chargement GLTF
 */
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  onError?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GLTFErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('GLTF loading error:', error);
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

interface HybridFurnitureItemProps {
  placement: HybridFurniturePlacement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: [number, number, number]) => void;
  floorPlane: THREE.Plane;
  floorWidth: number;
  floorDepth: number;
  onDragChange?: (isDragging: boolean) => void;
}

/**
 * Composant pour charger et afficher un modèle GLTF
 */
const GLTFModel = ({
  url,
  scale,
}: {
  url: string;
  scale: [number, number, number];
}) => {
  // Debug: log URL being loaded
  console.log('[GLTFModel] Loading model from URL:', url);

  const { scene } = useGLTF(url);
  const clonedScene = scene.clone();

  console.log('[GLTFModel] Model loaded successfully');

  // Activer les ombres sur tous les meshes du modèle
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={clonedScene} scale={scale} />;
};

/**
 * Box de fallback si pas de modèle 3D
 */
const FallbackBox = ({
  dimensions,
  color,
  isSelected,
  hovered,
}: {
  dimensions: { width: number; height: number; depth: number };
  color: string;
  isSelected: boolean;
  hovered: boolean;
}) => (
  <mesh castShadow receiveShadow>
    <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
    <meshStandardMaterial
      color={color}
      emissive={isSelected ? '#b8860b' : hovered ? '#daa520' : '#000000'}
      emissiveIntensity={isSelected ? 0.3 : hovered ? 0.15 : 0}
      roughness={0.7}
      metalness={0.1}
    />
  </mesh>
);

/**
 * Indicateur de chargement animé
 */
const LoadingIndicator = ({
  dimensions,
  color,
}: {
  dimensions: { width: number; height: number; depth: number };
  color: string;
}) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.02;
      }
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <mesh ref={meshRef}>
      <boxGeometry
        args={[
          dimensions.width * 0.5,
          dimensions.height * 0.5,
          dimensions.depth * 0.5,
        ]}
      />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
};

export const HybridFurnitureItem = ({
  placement,
  isSelected,
  onSelect,
  onPositionChange,
  floorPlane,
  floorWidth,
  floorDepth,
  onDragChange,
}: HybridFurnitureItemProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modelError, setModelError] = useState(false);
  const { camera, gl, raycaster } = useThree();

  const dragOffset = useRef(new THREE.Vector3());
  const intersectionPoint = useRef(new THREE.Vector3());

  // Reset model error quand l'URL change
  useEffect(() => {
    setModelError(false);
  }, [placement.modelUrl]);

  // Gestion du drag avec raycasting sur le plan du sol
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;

      // Calculer la position de la souris en coordonnées normalisées
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      // Mettre à jour le raycaster
      raycaster.setFromCamera(mouse, camera);

      // Trouver l'intersection avec le plan du sol
      if (raycaster.ray.intersectPlane(floorPlane, intersectionPoint.current)) {
        const newX = intersectionPoint.current.x - dragOffset.current.x;
        const newZ = intersectionPoint.current.z - dragOffset.current.z;

        // Y = 0 pour les modèles GLTF (origine au sol), sinon hauteur/2 pour les boxes
        const newY = placement.modelUrl
          ? 0
          : calculateFurnitureYPosition(placement.dimensions.height, placement.scale[1]);

        // Limiter aux dimensions du sol définies par l'utilisateur
        const clampedX = THREE.MathUtils.clamp(newX, -floorWidth, floorWidth);
        const clampedZ = THREE.MathUtils.clamp(newZ, -floorDepth, floorDepth);

        const newPosition: [number, number, number] = [clampedX, newY, clampedZ];

        onPositionChange(placement.id, newPosition);
      }
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragChange?.(false);
        document.body.style.cursor = hovered ? 'grab' : 'auto';
      }
    };

    if (isDragging) {
      canvas.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [
    isDragging,
    camera,
    gl,
    raycaster,
    floorPlane,
    floorWidth,
    floorDepth,
    placement,
    onPositionChange,
    hovered,
    onDragChange,
  ]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(placement.id);

    // Calculer l'offset entre le clic et le centre du meuble
    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.nativeEvent.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.nativeEvent.clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);

    if (raycaster.ray.intersectPlane(floorPlane, intersectionPoint.current)) {
      dragOffset.current.set(
        intersectionPoint.current.x - placement.position[0],
        0,
        intersectionPoint.current.z - placement.position[2]
      );
    }

    setIsDragging(true);
    onDragChange?.(true);
    document.body.style.cursor = 'grabbing';
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (!isDragging) {
      document.body.style.cursor = 'grab';
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (!isDragging) {
      document.body.style.cursor = 'auto';
    }
  };

  const hasModel = placement.modelUrl && !modelError;

  // Debug: log what modelUrl we received
  console.log('[HybridFurnitureItem] Placement:', {
    id: placement.id,
    name: placement.name,
    modelUrl: placement.modelUrl,
    hasModel,
    modelError,
  });

  return (
    <group ref={groupRef}>
      {hasModel ? (
        // Rendu du modèle GLTF avec Suspense pour le chargement et ErrorBoundary pour les erreurs
        <group
          position={placement.position}
          rotation={placement.rotation}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <GLTFErrorBoundary
            fallback={
              <FallbackBox
                dimensions={placement.dimensions}
                color={placement.color}
                isSelected={isSelected}
                hovered={hovered}
              />
            }
            onError={() => setModelError(true)}
          >
            <Suspense
              fallback={
                <LoadingIndicator
                  dimensions={placement.dimensions}
                  color={placement.color}
                />
              }
            >
              <GLTFModel url={placement.modelUrl!} scale={placement.scale} />
            </Suspense>
          </GLTFErrorBoundary>
        </group>
      ) : (
        // Fallback: box colorée
        <group
          position={placement.position}
          rotation={placement.rotation}
          scale={placement.scale}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <FallbackBox
            dimensions={placement.dimensions}
            color={placement.color}
            isSelected={isSelected}
            hovered={hovered}
          />
        </group>
      )}

      {/* Contour de sélection */}
      {isSelected && (
        <lineSegments
          position={placement.position}
          rotation={placement.rotation}
          scale={placement.scale}
        >
          <edgesGeometry
            args={[
              new THREE.BoxGeometry(
                placement.dimensions.width * 1.02,
                placement.dimensions.height * 1.02,
                placement.dimensions.depth * 1.02
              ),
            ]}
          />
          <lineBasicMaterial color="#b8860b" linewidth={2} />
        </lineSegments>
      )}

      {/* Indicateur de drag (ombre au sol) */}
      {isDragging && (
        <mesh
          position={[placement.position[0], 0.02, placement.position[2]]}
          rotation={[-Math.PI / 2, 0, placement.rotation[1]]}
        >
          <planeGeometry
            args={[
              placement.dimensions.width * placement.scale[0] * 1.1,
              placement.dimensions.depth * placement.scale[2] * 1.1,
            ]}
          />
          <meshBasicMaterial color="#b8860b" opacity={0.3} transparent />
        </mesh>
      )}
    </group>
  );
};
