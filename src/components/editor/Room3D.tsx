import { useRef } from "react";
// import { useFrame } from "@react-three/fiber";
import { Grid, Environment } from "@react-three/drei";
import * as THREE from "three";

interface Room3DProps {
  width?: number;
  depth?: number;
  height?: number;
}

export const Room3D = ({ width = 10, depth = 10, height = 3 }: Room3DProps) => {
  const floorRef = useRef<THREE.Mesh>(null);

  return (
    <group>
      {/* Floor */}
      <mesh 
        ref={floorRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, depth]} />
        <meshStandardMaterial color="#f5f5f0" />
      </mesh>

      {/* Grid helper */}
      <Grid
        args={[width, depth]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#e0e0e0"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#c0c0c0"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        position={[0, 0.01, 0]}
      />

      {/* Walls */}
      {/* Back wall */}
      <mesh position={[0, height / 2, -depth / 2]} receiveShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#fafafa" side={THREE.DoubleSide} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#f8f8f8" side={THREE.DoubleSide} />
      </mesh>

      {/* Right wall */}
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[depth, height]} />
        <meshStandardMaterial color="#f8f8f8" side={THREE.DoubleSide} />
      </mesh>

      {/* Environment lighting */}
      <Environment preset="apartment" />
    </group>
  );
};
