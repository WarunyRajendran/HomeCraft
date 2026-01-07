import { useRef, useState, useEffect } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export interface FurniturePlacement {
  id: string;
  furnitureId: string;
  name: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
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
}

export const FurnitureItem = ({
  placement,
  isSelected,
  onSelect,
  onPositionChange,
  floorPlane,
}: FurnitureItemProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { camera, gl, raycaster } = useThree();
  
  const dragOffset = useRef(new THREE.Vector3());
  const intersectionPoint = useRef(new THREE.Vector3());

  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDragging || !meshRef.current) return;

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
  }, [isDragging, camera, gl, raycaster, floorPlane, placement, onPositionChange, hovered]);

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
    document.body.style.cursor = "grabbing";
  };

  return (
    <group>
      <mesh
        ref={meshRef}
        position={placement.position}
        rotation={placement.rotation}
        scale={placement.scale}
        onPointerDown={handlePointerDown}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          if (!isDragging) {
            document.body.style.cursor = "grab";
          }
        }}
        onPointerOut={() => {
          setHovered(false);
          if (!isDragging) {
            document.body.style.cursor = "auto";
          }
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[
          placement.dimensions.width,
          placement.dimensions.height,
          placement.dimensions.depth
        ]} />
        <meshStandardMaterial
          color={placement.color}
          emissive={isSelected ? "#b8860b" : hovered ? "#daa520" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
        />
      </mesh>
      
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
