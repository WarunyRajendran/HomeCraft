import { useMemo, useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { Room3D } from "./Room3D";
import { FurnitureItem } from "./FurnitureItem";
import type { FurniturePlacement } from "./FurnitureItem";
import * as THREE from "three";

interface Scene3DProps {
  placements: FurniturePlacement[];
  selectedId: string | null;
  onSelectFurniture: (id: string | null) => void;
  onPositionChange: (id: string, position: [number, number, number]) => void;
  roomDimensions: {
    width: number;
    depth: number;
    height: number;
  };
}

interface SceneContentProps extends Scene3DProps {
  isDragging: boolean;
  onDragChange: (isDragging: boolean) => void;
}

const SceneContent = ({
  placements,
  selectedId,
  onSelectFurniture,
  onPositionChange,
  roomDimensions,
  isDragging,
  onDragChange,
}: SceneContentProps) => {
  // Create a floor plane for raycasting during drag
  const floorPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 6, 8]} fov={50} />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />

      {/* Room */}
      <Room3D
        width={roomDimensions.width}
        depth={roomDimensions.depth}
        height={roomDimensions.height}
      />

      {/* Furniture */}
      {placements.map((placement) => (
        <FurnitureItem
          key={placement.id}
          placement={placement}
          isSelected={selectedId === placement.id}
          onSelect={onSelectFurniture}
          onPositionChange={onPositionChange}
          floorPlane={floorPlane}
          onDragChange={onDragChange}
        />
      ))}

      {/* Click on empty space to deselect */}
      <mesh
        position={[0, -0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={() => onSelectFurniture(null)}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Controls - disabled during furniture drag */}
      <OrbitControls
        makeDefault
        enabled={!isDragging}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={3}
        maxDistance={20}
        target={[0, 0, 0]}
        enablePan={true}
        panSpeed={0.5}
      />
    </>
  );
};

export const Scene3D = (props: Scene3DProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragChange = useCallback((dragging: boolean) => {
    setIsDragging(dragging);
  }, []);

  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-100 to-slate-200 rounded-lg overflow-hidden">
      <Canvas shadows>
        <SceneContent {...props} isDragging={isDragging} onDragChange={handleDragChange} />
      </Canvas>
    </div>
  );
};
