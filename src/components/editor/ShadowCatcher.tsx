/**
 * ShadowCatcher - Plan invisible qui capture uniquement les ombres
 * Utilisé en mode hybride pour rendre les ombres des meubles 3D sur la photo
 */

import { useMemo } from 'react';
import * as THREE from 'three';

interface ShadowCatcherProps {
  /** Largeur du plan en mètres */
  width?: number;
  /** Profondeur du plan en mètres */
  depth?: number;
  /** Position Y du plan (normalement 0 pour le sol) */
  yPosition?: number;
  /** Opacité des ombres (0-1) */
  shadowOpacity?: number;
  /** Afficher le plan en mode debug */
  debug?: boolean;
}

export const ShadowCatcher = ({
  width = 20,
  depth = 20,
  yPosition = 0,
  shadowOpacity = 0.4,
  debug = false,
}: ShadowCatcherProps) => {
  // Créer un material personnalisé qui ne rend que les ombres
  const shadowMaterial = useMemo(() => {
    // En mode debug, on affiche un plan semi-transparent
    if (debug) {
      return new THREE.MeshStandardMaterial({
        color: '#cccccc',
        transparent: true,
        opacity: 0.3,
      });
    }

    // ShadowMaterial: material spécial qui est transparent sauf pour les ombres
    const material = new THREE.ShadowMaterial({
      opacity: shadowOpacity,
      color: new THREE.Color(0x000000),
    });

    return material;
  }, [shadowOpacity, debug]);

  return (
    <mesh
      position={[0, yPosition, 0]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[width, depth]} />
      <primitive object={shadowMaterial} />
    </mesh>
  );
};

/**
 * Grille de calibration visible pendant la configuration de la perspective
 * Aide l'utilisateur à aligner la perspective avec la photo
 */
interface CalibrationGridProps {
  /** Largeur du plan en mètres */
  width: number;
  /** Profondeur du plan en mètres */
  depth: number;
  /** Nombre de divisions de la grille */
  divisions?: number;
  /** Couleur de la grille */
  color?: string;
  /** Opacité de la grille */
  opacity?: number;
}

export const CalibrationGrid = ({
  width,
  depth,
  divisions = 10,
  color = '#b8860b',
  opacity = 0.5,
}: CalibrationGridProps) => {
  return (
    <group position={[0, 0.01, 0]}>
      {/* Grille principale */}
      <gridHelper
        args={[Math.max(width, depth), divisions, color, color]}
        rotation={[0, 0, 0]}
      />

      {/* Contour du sol */}
      <lineSegments>
        <edgesGeometry
          args={[new THREE.PlaneGeometry(width, depth)]}
        />
        <lineBasicMaterial color={color} opacity={opacity} transparent />
      </lineSegments>

      {/* Marqueurs aux coins */}
      {[
        [-width / 2, 0, -depth / 2],
        [width / 2, 0, -depth / 2],
        [width / 2, 0, depth / 2],
        [-width / 2, 0, depth / 2],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};
