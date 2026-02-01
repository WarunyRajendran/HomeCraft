import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import { OrthographicCamera } from "@react-three/drei";
import * as THREE from "three";

interface FurnitureItem2D {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  imageUrl: string | null;
  scale: number;
}

interface PhotoSceneProps {
  backgroundImage: string | null;
  furniture: FurnitureItem2D[];
  selectedId: string | null;
  onSelectFurniture: (id: string | null) => void;
  onUpdateFurniture: (id: string, updates: Partial<FurnitureItem2D>) => void;
}

// Taille fixe du canvas virtuel (système de coordonnées)
const CANVAS_WIDTH = 10;
const CANVAS_HEIGHT = 7.5; // Ratio 4:3

interface DraggableFurnitureProps {
  item: FurnitureItem2D;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<FurnitureItem2D>) => void;
  viewportSize: { width: number; height: number };
}

// Composant pour afficher l'image du meuble
const FurnitureImage = ({
  url,
  width,
  height,
  meshRef,
}: {
  url: string;
  width: number;
  height: number;
  meshRef: React.RefObject<THREE.Mesh | null>;
}) => {
  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    return loader.load(url);
  }, [url]);

  return (
    <mesh ref={meshRef} raycast={() => null}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
};

const DraggableFurniture = ({
  item,
  isSelected,
  onSelect,
  onUpdate,
  // viewportSize,
}: DraggableFurnitureProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { camera, gl, raycaster } = useThree();
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = gl.domElement;

    const getPositionFromEvent = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        return intersection;
      }
      return null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;
      const intersection = getPositionFromEvent(event.clientX, event.clientY);
      if (intersection) {
        onUpdate({
          x: intersection.x - dragOffset.current.x,
          y: intersection.y - dragOffset.current.y,
        });
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging || !event.touches[0]) return;
      event.preventDefault();
      const intersection = getPositionFromEvent(event.touches[0].clientX, event.touches[0].clientY);
      if (intersection) {
        onUpdate({
          x: intersection.x - dragOffset.current.x,
          y: intersection.y - dragOffset.current.y,
        });
      }
    };

    const handleEnd = () => {
      if (isDragging) {
        setIsDragging(false);
        document.body.style.cursor = hovered ? "grab" : "auto";
      }
    };

    if (isDragging) {
      canvas.addEventListener("pointermove", handlePointerMove);
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("pointerup", handleEnd);
      window.addEventListener("pointercancel", handleEnd);
      window.addEventListener("touchend", handleEnd);
      window.addEventListener("touchcancel", handleEnd);
    }

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("pointerup", handleEnd);
      window.removeEventListener("pointercancel", handleEnd);
      window.removeEventListener("touchend", handleEnd);
      window.removeEventListener("touchcancel", handleEnd);
    };
  }, [isDragging, camera, gl, raycaster, onUpdate, hovered]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect();

    const rect = gl.domElement.getBoundingClientRect();
    const clientX = event.nativeEvent.clientX;
    const clientY = event.nativeEvent.clientY;

    const mouse = new THREE.Vector2(
      ((clientX - rect.left) / rect.width) * 2 - 1,
      -((clientY - rect.top) / rect.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersection = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(plane, intersection)) {
      dragOffset.current = {
        x: intersection.x - item.x,
        y: intersection.y - item.y,
      };
    }

    setIsDragging(true);
  };

  const scaledWidth = item.width * item.scale;
  const scaledHeight = item.height * item.scale;

  // Zone de touche élargie pour les petits meubles (minimum 0.4 x 0.4)
  const minTouchSize = 0.4;
  const touchWidth = Math.max(scaledWidth, minTouchSize);
  const touchHeight = Math.max(scaledHeight, minTouchSize);

  return (
    <group position={[item.x, item.y, 0.1]} rotation={[0, 0, item.rotation]}>
      {/* Zone de touche invisible (élargie pour les petits meubles) */}
      <mesh
        position={[0, 0, -0.01]}
        onPointerDown={handlePointerDown}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          if (!isDragging) document.body.style.cursor = "grab";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(false);
          if (!isDragging) document.body.style.cursor = "auto";
        }}
      >
        <planeGeometry args={[touchWidth, touchHeight]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Furniture visual */}
      {item.imageUrl ? (
        <FurnitureImage
          url={item.imageUrl}
          width={scaledWidth}
          height={scaledHeight}
          meshRef={meshRef}
        />
      ) : (
        <>
          {/* Fallback: colored box if no image */}
          <mesh
            ref={meshRef}
            raycast={() => null}
          >
            <boxGeometry args={[scaledWidth, scaledHeight, 0.05]} />
            <meshStandardMaterial
              color={item.color}
              emissive={isSelected ? "#3b82f6" : hovered ? "#daa520" : "#000000"}
              emissiveIntensity={isSelected ? 0.15 : hovered ? 0.2 : 0}
            />
          </mesh>

          {/* 3D depth effect - top face */}
          <mesh position={[0, scaledHeight * 0.15, 0.08]} raycast={() => null}>
            <boxGeometry args={[scaledWidth * 0.95, scaledHeight * 0.3, 0.08]} />
            <meshStandardMaterial
              color={item.color}
              emissive={isSelected ? "#ffffff" : "#000000"}
              emissiveIntensity={isSelected ? 0.5 : 0}
            />
          </mesh>
        </>
      )}

      {/* Selection indicator - Option 2: Coins de sélection (taille proportionnelle) */}
      {isSelected && (() => {
        // Taille des carrés proportionnelle au meuble (min 0.03, max 0.08)
        const cornerSize = Math.min(0.08, Math.max(0.03, Math.min(scaledWidth, scaledHeight) * 0.15));
        return (
          <>
            {/* Coin haut-gauche */}
            <mesh position={[-scaledWidth / 2, scaledHeight / 2, 0.15]} raycast={() => null}>
              <planeGeometry args={[cornerSize, cornerSize]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            {/* Coin haut-droit */}
            <mesh position={[scaledWidth / 2, scaledHeight / 2, 0.15]} raycast={() => null}>
              <planeGeometry args={[cornerSize, cornerSize]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            {/* Coin bas-gauche */}
            <mesh position={[-scaledWidth / 2, -scaledHeight / 2, 0.15]} raycast={() => null}>
              <planeGeometry args={[cornerSize, cornerSize]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            {/* Coin bas-droit */}
            <mesh position={[scaledWidth / 2, -scaledHeight / 2, 0.15]} raycast={() => null}>
              <planeGeometry args={[cornerSize, cornerSize]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </>
        );
      })()}

    </group>
  );
};

const BackgroundImage = ({ url }: { url: string }) => {
  const [imageAspect, setImageAspect] = useState(1);

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const loadedTexture = loader.load(url, (tex) => {
      // Calculer le ratio d'aspect de l'image
      const aspect = tex.image.width / tex.image.height;
      setImageAspect(aspect);
    });
    return loadedTexture;
  }, [url]);

  // Calculer les dimensions pour préserver le ratio d'aspect (cover) avec le canvas fixe
  const canvasAspect = CANVAS_WIDTH / CANVAS_HEIGHT;

  let width = CANVAS_WIDTH;
  let height = CANVAS_HEIGHT;

  if (imageAspect > canvasAspect) {
    // L'image est plus large proportionnellement
    width = CANVAS_HEIGHT * imageAspect;
    height = CANVAS_HEIGHT;
  } else {
    // L'image est plus haute proportionnellement
    width = CANVAS_WIDTH;
    height = CANVAS_WIDTH / imageAspect;
  }

  return (
    <mesh position={[0, 0, -0.1]} raycast={() => null}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
};

const SceneContent = ({
  backgroundImage,
  furniture,
  selectedId,
  onSelectFurniture,
  onUpdateFurniture,
}: PhotoSceneProps) => {
  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[0, 0, 5]}
        left={-CANVAS_WIDTH / 2}
        right={CANVAS_WIDTH / 2}
        top={CANVAS_HEIGHT / 2}
        bottom={-CANVAS_HEIGHT / 2}
        near={0.1}
        far={100}
      />

      {/* Lighting for 3D-like furniture */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 5, 5]} intensity={0.3} />

      {/* Background image */}
      {backgroundImage && <BackgroundImage url={backgroundImage} />}

      {/* Background color when no image */}
      {!backgroundImage && (
        <mesh position={[0, 0, -0.2]} raycast={() => null}>
          <planeGeometry args={[CANVAS_WIDTH, CANVAS_HEIGHT]} />
          <meshBasicMaterial color="#f1f5f9" />
        </mesh>
      )}

      {/* Furniture items */}
      {furniture.map((item) => (
        <DraggableFurniture
          key={item.id}
          item={item}
          isSelected={selectedId === item.id}
          onSelect={() => onSelectFurniture(item.id)}
          onUpdate={(updates) => onUpdateFurniture(item.id, updates)}
          viewportSize={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        />
      ))}
    </>
  );
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface FurnitureItem2DType extends FurnitureItem2D {}

export const PhotoScene = (props: PhotoSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventScroll = (e: TouchEvent) => {
      e.preventDefault();
    };

    el.addEventListener('touchmove', preventScroll, { passive: false });

    return () => {
      el.removeEventListener('touchmove', preventScroll);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-muted rounded-lg overflow-hidden touch-none transition-all duration-300 ease-in-out"
    >
      <Canvas
        style={{ touchAction: 'none' }}
        gl={{ antialias: true }}
        onPointerMissed={() => props.onSelectFurniture(null)}
      >
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};
