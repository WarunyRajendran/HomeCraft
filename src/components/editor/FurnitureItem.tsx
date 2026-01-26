import { useRef, useState, useEffect, Suspense } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export interface FurniturePlacement {
  id: string;
  furnitureId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  modelUrl: string | null;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
}

interface FurnitureItemProps {
  placement: FurniturePlacement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onPositionChange: (id: string, position: [number, number, number]) => void;
  floorPlane: THREE.Plane;
  onDragChange?: (isDragging: boolean) => void;
}

// Component for loading and displaying GLTF models
const GLTFModel = ({
  url,
  scale,
}: {
  url: string;
  scale: [number, number, number];
}) => {
  const { scene } = useGLTF(url);
  const clonedScene = scene.clone();

  // Apply color tint to materials if needed
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return <primitive object={clonedScene} scale={scale} />;
};

// Fallback box shown while loading or if no model
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
  <>
    <boxGeometry args={[dimensions.width, dimensions.height, dimensions.depth]} />
    <meshStandardMaterial
      color={color}
      emissive={isSelected ? "#b8860b" : hovered ? "#daa520" : "#000000"}
      emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
    />
  </>
);

// Loading indicator (spinning box)
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
      <boxGeometry args={[
        dimensions.width * 0.5,
        dimensions.height * 0.5,
        dimensions.depth * 0.5
      ]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
};

export const FurnitureItem = ({
  placement,
  isSelected,
  onSelect,
  onPositionChange,
  floorPlane,
  onDragChange,
}: FurnitureItemProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [modelError, setModelError] = useState(false);
  const { camera, gl, raycaster } = useThree();

  const dragOffset = useRef(new THREE.Vector3());
  const intersectionPoint = useRef(new THREE.Vector3());

  // Reset model error when modelUrl changes
  useEffect(() => {
    setModelError(false);
  }, [placement.modelUrl]);

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging) return;

      // Calculate mouse position in normalized device coordinates
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      // Update raycaster
      raycaster.setFromCamera(mouse, camera);

      // Find intersection with floor plane
      if (raycaster.ray.intersectPlane(floorPlane, intersectionPoint.current)) {
        const newX = intersectionPoint.current.x - dragOffset.current.x;
        const newZ = intersectionPoint.current.z - dragOffset.current.z;

        // Keep Y position based on furniture height
        const newPosition: [number, number, number] = [
          newX,
          placement.dimensions.height / 2,
          newZ,
        ];

        onPositionChange(placement.id, newPosition);
      }
    };

    const handlePointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onDragChange?.(false);
        document.body.style.cursor = hovered ? "grab" : "auto";
      }
    };

    if (isDragging) {
      canvas.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      canvas.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, camera, gl, raycaster, floorPlane, placement, onPositionChange, hovered, onDragChange]);

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onSelect(placement.id);

    // Calculate offset from mesh center to click point
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
    document.body.style.cursor = "grabbing";
  };

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    if (!isDragging) {
      document.body.style.cursor = "grab";
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    if (!isDragging) {
      document.body.style.cursor = "auto";
    }
  };

  const hasModel = placement.modelUrl && !modelError;

  return (
    <group ref={groupRef}>
      {hasModel ? (
        // Render GLTF model with Suspense for loading
        <group
          position={placement.position}
          rotation={placement.rotation}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <Suspense
            fallback={
              <LoadingIndicator
                dimensions={placement.dimensions}
                color={placement.color}
              />
            }
          >
            <GLTFModel
              url={placement.modelUrl!}
              scale={placement.scale}
            />
          </Suspense>
        </group>
      ) : (
        // Render colored box fallback
        <mesh
          ref={meshRef}
          position={placement.position}
          rotation={placement.rotation}
          scale={placement.scale}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          castShadow
          receiveShadow
        >
          <FallbackBox
            dimensions={placement.dimensions}
            color={placement.color}
            isSelected={isSelected}
            hovered={hovered}
          />
        </mesh>
      )}

      {/* Selection outline */}
      {isSelected && (
        <lineSegments position={placement.position} rotation={placement.rotation}>
          <edgesGeometry args={[new THREE.BoxGeometry(
            placement.dimensions.width * 1.02,
            placement.dimensions.height * 1.02,
            placement.dimensions.depth * 1.02
          )]} />
          <lineBasicMaterial color="#b8860b" linewidth={2} />
        </lineSegments>
      )}

      {/* Drag indicator shadow */}
      {isDragging && (
        <mesh
          position={[placement.position[0], 0.02, placement.position[2]]}
          rotation={[-Math.PI / 2, 0, placement.rotation[1]]}
        >
          <planeGeometry args={[
            placement.dimensions.width * 1.1,
            placement.dimensions.depth * 1.1
          ]} />
          <meshBasicMaterial color="#b8860b" opacity={0.3} transparent />
        </mesh>
      )}
    </group>
  );
};
